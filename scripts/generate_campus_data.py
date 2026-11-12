#!/usr/bin/env python3
"""Fetch OSM neighborhood polygons and campus entrances, then route with OSRM."""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
USER_AGENT = "RoomyCampusPrototype/1.0 (academic OSM data generator)"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.nchc.org.tw/api/interpreter",
]
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
OSM_API_URL = "https://api.openstreetmap.org/api/0.6"
ESPOL = (-2.1467, -79.9643)
AREA_BOX = "-2.23,-80.08,-2.08,-79.82"
CAMPUS_BOX = "-2.157,-79.981,-2.135,-79.948"
VERIFIED_BOUNDARY_IDS = {"Los Ceibos": 2048283, "Mapasingue": 2048285, "Urdesa": 10295044}
OVERPASS_AVAILABLE: bool | None = None
SECTORS = [
    ("ceibos", "Los Ceibos", "Los Ceibos, Guayaquil, Ecuador"),
    ("mapasingue", "Mapasingue", "Mapasingue, Guayaquil, Ecuador"),
    ("via-costa", "Vía a la Costa", "Via a la Costa, Guayaquil, Ecuador"),
    ("urdesa", "Urdesa", "Urdesa, Guayaquil, Ecuador"),
]


def fetch_json(url: str, *, data: bytes | None = None, timeout: int = 50) -> dict | list:
    request = Request(
        url,
        data=data,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:400]
        raise RuntimeError(f"El servicio devolvió HTTP {error.code}: {detail}") from error
    except (TimeoutError, URLError) as error:
        raise RuntimeError(f"No se pudo consultar el servicio cartográfico: {error}") from error
    except json.JSONDecodeError as error:
        raise RuntimeError("El servicio cartográfico devolvió una respuesta JSON inválida.") from error


def fetch_overpass(query: str) -> dict:
    global OVERPASS_AVAILABLE
    if OVERPASS_AVAILABLE is False:
        raise RuntimeError("Los servidores Overpass no estuvieron disponibles en la consulta anterior.")
    errors = []
    for endpoint in OVERPASS_URLS:
        try:
            response = fetch_json(endpoint, data=urlencode({"data": query}).encode("ascii"), timeout=18)
        except RuntimeError as error:
            errors.append(f"{endpoint}: {error}")
            continue
        if not isinstance(response, dict):
            errors.append(f"{endpoint}: respuesta Overpass inesperada.")
            continue
        OVERPASS_AVAILABLE = True
        return response
    OVERPASS_AVAILABLE = False
    details = "\n".join(errors)
    raise RuntimeError(f"No se pudo consultar Overpass en sus servidores públicos:\n{details}")


def fetch_osm_xml(url: str, *, timeout: int = 50) -> ET.Element:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/xml"})
    try:
        with urlopen(request, timeout=timeout) as response:
            return ET.fromstring(response.read())
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:400]
        raise RuntimeError(f"La API de OpenStreetMap devolvió HTTP {error.code}: {detail}") from error
    except (TimeoutError, URLError) as error:
        raise RuntimeError(f"No se pudo consultar la API de OpenStreetMap: {error}") from error
    except ET.ParseError as error:
        raise RuntimeError("La API de OpenStreetMap devolvió XML inválido.") from error


def fetch_osm_object(object_type: str, object_id: int) -> dict:
    endpoint = "relation" if object_type == "relation" else "way"
    suffix = "/full" if object_type == "relation" else "/full"
    root = fetch_osm_xml(f"{OSM_API_URL}/{endpoint}/{object_id}{suffix}")
    nodes = {
        node.get("id"): {"lat": float(node.get("lat", "0")), "lon": float(node.get("lon", "0"))}
        for node in root.findall("node")
    }
    osm_element = root.find(endpoint)
    if osm_element is None:
        raise RuntimeError(f"La API de OpenStreetMap no devolvió {object_type}/{object_id}.")
    tags = {tag.get("k", ""): tag.get("v", "") for tag in osm_element.findall("tag")}
    if object_type == "way":
        way = root.find("way")
        if way is None:
            raise RuntimeError(f"La API de OpenStreetMap no devolvió way/{object_id}.")
        return {
            "type": "way",
            "id": object_id,
            "tags": tags,
            "geometry": [nodes[member.get("ref", "")] for member in way.findall("nd") if member.get("ref") in nodes],
        }

    relation = root.find("relation")
    if relation is None:
        raise RuntimeError(f"La API de OpenStreetMap no devolvió relation/{object_id}.")
    ways = {way.get("id"): way for way in root.findall("way")}
    members = []
    for member in relation.findall("member"):
        if member.get("type") != "way" or member.get("ref") not in ways:
            continue
        way = ways[member.get("ref", "")]
        geometry = [nodes[item.get("ref", "")] for item in way.findall("nd") if item.get("ref") in nodes]
        members.append({"type": "way", "role": member.get("role", ""), "geometry": geometry})
    return {"type": "relation", "id": object_id, "tags": tags, "members": members}


def normalize_name(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(character for character in normalized if not unicodedata.combining(character)).casefold()


def named_boundary(label: str) -> tuple[str, int, str] | None:
    aliases = {
        "Los Ceibos": ["Los Ceibos", "Ceibos"],
        "Mapasingue": ["Mapasingue"],
        "Vía a la Costa": ["Via a la Costa"],
        "Urdesa": ["Urdesa"],
    }[label]
    alternatives = "|".join(aliases)
    query = (
        "[out:json][timeout:30];("
        f'relation["boundary"]["name"~"^({alternatives})$",i]({AREA_BOX});'
        f'way["boundary"]["name"~"^({alternatives})$",i]({AREA_BOX});'
        f'relation["place"~"suburb|neighbourhood|quarter"]["name"~"^({alternatives})$",i]({AREA_BOX});'
        f'way["place"~"suburb|neighbourhood|quarter"]["name"~"^({alternatives})$",i]({AREA_BOX});'
        ");out tags center;"
    )
    response = fetch_overpass(query)
    candidates = [
        item
        for item in response.get("elements", [])
        if normalize_name(str(item.get("tags", {}).get("name", "")))
        in {normalize_name(alias) for alias in aliases}
        and item.get("type") in {"way", "relation"}
    ]
    if not candidates:
        return None
    candidates.sort(
        key=lambda item: haversine_km(
            ESPOL,
            [
                float(item.get("center", {}).get("lat", ESPOL[0])),
                float(item.get("center", {}).get("lon", ESPOL[1])),
            ],
        )
    )
    candidate = candidates[0]
    return candidate["type"], int(candidate["id"]), str(candidate["tags"]["name"])


def geocode_polygon(search: str, label: str) -> tuple[str, int, str, bool]:
    result = fetch_json(
        f"{NOMINATIM_URL}?{urlencode({'q': search, 'format': 'jsonv2', 'polygon_geojson': 1, 'limit': 30})}"
    )
    if not isinstance(result, list):
        raise RuntimeError(f"Nominatim no devolvió resultados válidos para {label}.")

    for candidate in result:
        geo_type = candidate.get("geojson", {}).get("type")
        object_type = candidate.get("osm_type")
        object_id = candidate.get("osm_id")
        if not object_id:
            continue
        if geo_type in {"Polygon", "MultiPolygon"} and object_type in {"way", "relation"}:
            return object_type, int(object_id), str(candidate.get("name") or label), False

    boundary_error = ""
    try:
        boundary = named_boundary(label)
    except RuntimeError as error:
        boundary = None
        boundary_error = str(error)
    if boundary:
        return boundary[0], boundary[1], boundary[2], False

    if label in VERIFIED_BOUNDARY_IDS:
        if boundary_error:
            print(f"Aviso: {label}: Overpass no respondió; se usará la relación OSM verificada {VERIFIED_BOUNDARY_IDS[label]} mediante la API OSM.", file=sys.stderr)
        return "relation", VERIFIED_BOUNDARY_IDS[label], label, False

    line_candidates = [
        candidate
        for candidate in result
        if candidate.get("geojson", {}).get("type") == "LineString"
        and candidate.get("osm_type") == "way"
        and candidate.get("osm_id")
    ]
    if line_candidates:
        def distance_to_road(candidate: dict) -> float:
            return min(
                haversine_km(ESPOL, (point[1], point[0]))
                for point in candidate["geojson"]["coordinates"]
            )

        line_candidates.sort(key=distance_to_road)
        candidate = line_candidates[0]
        return "way", int(candidate["osm_id"]), str(candidate.get("name") or label), True

    raise RuntimeError(
        f"No se encontró un polígono OSM de área para {label}. "
        "No se modificaron los datos; revisa la relación o way en OpenStreetMap antes de reintentar."
    )


def overpass_object(object_type: str, object_id: int) -> dict:
    query = f"[out:json][timeout:35];{object_type}({object_id});out geom;"
    try:
        response = fetch_overpass(query)
        if response.get("elements"):
            return response["elements"][0]
    except RuntimeError as error:
        print(f"Aviso: Overpass no pudo obtener {object_type}/{object_id}; se usará la API OSM: {error}", file=sys.stderr)
    return fetch_osm_object(object_type, object_id)


def latlon_ring(points: list[dict]) -> list[list[float]]:
    return [[float(point["lat"]), float(point["lon"])] for point in points]


def convex_hull(points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    unique = sorted(set(points))
    if len(unique) < 3:
        raise RuntimeError("No hay suficientes puntos OSM para construir una zona referencial.")

    def cross(origin: tuple[float, float], first: tuple[float, float], second: tuple[float, float]) -> float:
        return (first[0] - origin[0]) * (second[1] - origin[1]) - (first[1] - origin[1]) * (second[0] - origin[0])

    lower: list[tuple[float, float]] = []
    for point in unique:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], point) <= 0:
            lower.pop()
        lower.append(point)
    upper: list[tuple[float, float]] = []
    for point in reversed(unique):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], point) <= 0:
            upper.pop()
        upper.append(point)
    return lower[:-1] + upper[:-1]


def approximate_road_polygon(geometry: list[dict]) -> list[list[float]]:
    points = [(float(point["lon"]), float(point["lat"])) for point in geometry]
    center_lat = sum(latitude for _, latitude in points) / len(points)
    center_lon = sum(longitude for longitude, _ in points) / len(points)
    scale = math.cos(math.radians(center_lat))
    radius = 0.0045
    offsets: list[tuple[float, float]] = []
    for index, (longitude, latitude) in enumerate(points):
        first = points[max(0, index - 1)]
        second = points[min(len(points) - 1, index + 1)]
        dx = (second[0] - first[0]) * scale
        dy = second[1] - first[1]
        length = math.hypot(dx, dy)
        if length == 0:
            continue
        normal_x = -dy / length * radius
        normal_y = dx / length * radius
        offsets.append((longitude + normal_x / scale, latitude + normal_y))
        offsets.append((longitude - normal_x / scale, latitude - normal_y))
    hull = convex_hull(offsets)
    polygon = [[round(latitude, 7), round(longitude, 7)] for longitude, latitude in hull]
    polygon.append(polygon[0])
    return polygon


def relation_outer_rings(element: dict) -> tuple[list[list[list[float]]], bool]:
    segments = [
        latlon_ring(member["geometry"])
        for member in element.get("members", [])
        if member.get("type") == "way"
        and member.get("role") in {"outer", ""}
        and len(member.get("geometry", [])) >= 2
    ]
    rings: list[list[list[float]]] = []
    repaired = False
    while segments:
        ring = segments.pop(0)
        changed = True
        while changed and ring[0] != ring[-1]:
            changed = False
            for index, segment in enumerate(segments):
                if ring[-1] == segment[0]:
                    ring.extend(segment[1:])
                elif ring[-1] == segment[-1]:
                    ring.extend(reversed(segment[:-1]))
                elif ring[0] == segment[-1]:
                    ring = segment[:-1] + ring
                elif ring[0] == segment[0]:
                    ring = list(reversed(segment[1:])) + ring
                else:
                    continue
                segments.pop(index)
                changed = True
                break
        if len(ring) >= 3:
            if ring[0] != ring[-1]:
                ring.append(ring[0])
                repaired = True
            rings.append(ring)
    return rings, repaired


def polygon_from_osm(element: dict) -> tuple[list[list[list[float]]], bool]:
    if element.get("type") == "way":
        geometry = element.get("geometry", [])
        if len(geometry) >= 2:
            ring = latlon_ring(geometry)
            if len(ring) >= 4 and ring[0] == ring[-1]:
                return [ring], False
            return [approximate_road_polygon(geometry)], True
    rings, repaired = relation_outer_rings(element)
    if not rings:
        raise RuntimeError(
            f"La geometría OSM {element.get('type')}/{element.get('id')} "
            "no contiene anillos exteriores cerrados."
        )
    return rings, repaired


def center_of(ring: list[list[float]]) -> list[float]:
    points = ring[:-1] if ring[0] == ring[-1] else ring
    return [
        round(sum(point[0] for point in points) / len(points), 7),
        round(sum(point[1] for point in points) / len(points), 7),
    ]


def haversine_km(first: list[float] | tuple[float, float], second: list[float] | tuple[float, float]) -> float:
    lat1, lon1 = map(math.radians, first)
    lat2, lon2 = map(math.radians, second)
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1
    value = math.sin(delta_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2) ** 2
    return 6371 * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


def fetch_gates_from_osm_api() -> list[dict]:
    south, west, north, east = CAMPUS_BOX.split(",")
    root = fetch_osm_xml(f"{OSM_API_URL}/map?bbox={west},{south},{east},{north}", timeout=70)
    nodes = {node.get("id"): node for node in root.findall("node")}
    gates: list[dict] = []
    for node in nodes.values():
        tags = {tag.get("k", ""): tag.get("v", "") for tag in node.findall("tag")}
        if node.get("lat") and node.get("lon") and ("entrance" in tags or any(word in tags.get("name", "").casefold() for word in ("garita", "entrada", "portería", "porteria", "espol"))):
            gates.append({"type": "node", "tags": tags, "lat": float(node.get("lat", "0")), "lon": float(node.get("lon", "0"))})
    for way in root.findall("way"):
        tags = {tag.get("k", ""): tag.get("v", "") for tag in way.findall("tag")}
        if "entrance" not in tags and not any(word in tags.get("name", "").casefold() for word in ("garita", "entrada", "portería", "porteria", "espol")):
            continue
        points = [nodes[member.get("ref", "")] for member in way.findall("nd") if member.get("ref") in nodes]
        if not points:
            continue
        position = [
            sum(float(point.get("lat", "0")) for point in points) / len(points),
            sum(float(point.get("lon", "0")) for point in points) / len(points),
        ]
        gates.append({"type": "way", "tags": tags, "center": {"lat": position[0], "lon": position[1]}})
    return gates


def collect_gates(elements: list[dict]) -> list[dict]:
    gates: list[dict] = []
    seen: set[tuple[float, float]] = set()
    for element in elements:
        tags = element.get("tags", {})
        entrance_type = tags.get("entrance", "")
        is_named_access = any(word in str(tags.get("name", "")).casefold() for word in ("garita", "entrada", "portería", "porteria", "espol"))
        if entrance_type not in {"main", "yes"} and not is_named_access:
            continue
        point = element.get("center", element)
        if "lat" not in point or "lon" not in point:
            continue
        position = [round(float(point["lat"]), 7), round(float(point["lon"]), 7)]
        coordinate = (position[0], position[1])
        if coordinate in seen or haversine_km(ESPOL, position) > 2.0 or any(
            haversine_km(position, prior) < 0.08 for prior in seen
        ):
            continue
        seen.add(coordinate)
        name = tags.get("name") or tags.get("description") or (f"Acceso OSM no verificado ({tags.get('entrance')})" if tags.get("entrance") else None)
        if not name:
            name = f"Acceso registrado en OpenStreetMap {len(gates) + 1}"
        gates.append({"name": str(name), "position": position})
    return sorted(gates, key=lambda gate: haversine_km(ESPOL, gate["position"]))[:6]


def fetch_gates() -> list[dict]:
    south, west, north, east = CAMPUS_BOX.split(",")
    query = (
        "[out:json][timeout:35];("
        f'node["entrance"]({CAMPUS_BOX});way["entrance"]({CAMPUS_BOX});'
        f'node["name"~"garita|portería|porteria|entrada|espol",i]({CAMPUS_BOX});'
        f'way["name"~"garita|portería|porteria|entrada|espol",i]({CAMPUS_BOX});'
        f");out center tags;"
    )
    try:
        response = fetch_overpass(query)
        gates = collect_gates(response.get("elements", []))
        if gates:
            return gates
        print("Aviso: Overpass no devolvió accesos etiquetados; se consultará el mapa de OSM directamente.", file=sys.stderr)
    except RuntimeError as error:
        print(f"Aviso: Overpass no respondió para los accesos; se consultará el mapa de OSM directamente: {error}", file=sys.stderr)
    gates = collect_gates(fetch_gates_from_osm_api())
    if not gates:
        raise RuntimeError(
            f"No se encontraron entradas o garitas etiquetadas alrededor de ESPOL ({south}, {west}, {north}, {east}). "
            "No se sustituyeron por coordenadas inventadas; añade o revisa los accesos en OpenStreetMap y vuelve a intentar."
        )
    return gates


def fetch_route(center: list[float], gate: dict) -> dict:
    start = f"{center[1]},{center[0]}"
    end = f"{gate['position'][1]},{gate['position'][0]}"
    response = fetch_json(f"{OSRM_URL}/{start};{end}?overview=full&geometries=geojson&steps=false")
    if response.get("code") != "Ok" or not response.get("routes"):
        raise RuntimeError(f"OSRM no encontró una ruta de {start} a {end}: {response.get('message', response.get('code'))}")
    route = response["routes"][0]
    return {
        "distanceKm": round(route["distance"] / 1000, 2),
        "durationMinutes": round(route["duration"] / 60),
        "path": [[round(point[1], 7), round(point[0], 7)] for point in route["geometry"]["coordinates"]],
    }


def generate(output: Path) -> None:
    zones = []
    for identifier, label, search in SECTORS:
        object_type, object_id, osm_name, approximate = geocode_polygon(search, label)
        element = overpass_object(object_type, object_id)
        rings, geometry_approximate = polygon_from_osm(element)
        outer = max(rings, key=len)
        center = center_of(outer)
        zones.append(
            {
                "id": identifier,
                "name": osm_name,
                "center": center,
                "polygon": outer,
                "approximate": approximate or geometry_approximate,
            }
        )
        time.sleep(1.05)

    gates = fetch_gates()
    for zone in zones:
        closest_gate = min(gates, key=lambda gate: haversine_km(zone["center"], gate["position"]))
        zone["route"] = {
            **fetch_route(zone["center"], closest_gate),
            "gateName": closest_gate["name"],
        }

    payload = {
        "source": "Límites de barrio desde OpenStreetMap/Nominatim y Overpass; Vía a la Costa usa una zona vial referencial derivada de una vía OSM cuando no existe límite oficial. Accesos consultados en Overpass; rutas estimadas por el OSRM público. Verificar antes de uso operativo.",
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "gates": gates,
        "zones": zones,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    content = (
        'import type { CampusGeography } from "./campus.types";\n\n'
        "export const campusGeography: CampusGeography = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n"
    )
    output.write_text(content, encoding="utf-8")
    print(f"Se guardaron {len(zones)} sectores y {len(gates)} accesos en {output}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "src" / "data" / "campus.generated.ts",
        help="Ruta del módulo TypeScript a generar.",
    )
    arguments = parser.parse_args()
    try:
        generate(arguments.output.resolve())
    except RuntimeError as error:
        parser.exit(1, f"Error al generar datos de campus: {error}\n")


if __name__ == "__main__":
    main()
