import { CircleMarker, MapContainer, Marker, Polygon, Polyline, Popup, TileLayer } from "react-leaflet";
import L, { type DivIcon } from "leaflet";
import { listingPriceBreakdown, type Listing, type PropertyStatus } from "../data";
import { campusGeography } from "../data/campus.generated";

const statusNames: Record<PropertyStatus, string> = {
  available: "Disponible",
  reserved: "En negociación",
  occupied: "Ocupado",
  pending: "Por verificar",
  rejected: "Rechazado",
};

const money = (value: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function makePinIcon(listing: Listing, calendarDay: number): DivIcon {
  const pinColor = listing.status === "available" ? "#00b894" : listing.status === "reserved" ? "#f0aa2d" : listing.status === "pending" ? "#d63031" : "#89919a";
  return L.divIcon({
    className: "map-pin-wrap",
    html: `<div class="map-pin" style="--pin-color:${pinColor}">${money(listingPriceBreakdown(listing, calendarDay).total)}</div>`,
    iconSize: [88, 34],
    iconAnchor: [44, 34],
  });
}

export default function MapView({
  listings,
  onSelect,
  admin = false,
  calendarDay = 0,
}: {
  listings: Listing[];
  onSelect?: (listing: Listing) => void;
  admin?: boolean;
  calendarDay?: number;
}) {
  return (
    <div className={`map-frame ${admin ? "map-frame--admin" : ""}`}>
      <MapContainer center={[-2.15, -79.95]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {campusGeography.zones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: "#6c5ce7",
              weight: 1.5,
              dashArray: zone.approximate ? "5 5" : undefined,
              fillColor: "#6c5ce7",
              fillOpacity: 0.075,
            }}
          >
            <Popup>{zone.name}{zone.approximate ? " · área referencial" : ""}</Popup>
          </Polygon>
        ))}
        {campusGeography.gates.map((gate, index) => (
          <CircleMarker center={gate.position} key={`${gate.name}-${index}`} radius={8} pathOptions={{ color: "#4834d4", fillColor: "#6c5ce7", fillOpacity: 1 }}>
            <Popup>{gate.name}{gate.name.includes("referencial") ? " · ESPOL" : ""}</Popup>
          </CircleMarker>
        ))}
        {campusGeography.zones.map((zone) => {
          if (!zone.route) return null;
          const gate = campusGeography.gates.find((candidate) => candidate.name === zone.route?.gateName);
          if (!gate) return null;
          return (
            <Polyline key={`route-${zone.id}`} positions={zone.route.path.length > 1 ? zone.route.path : [zone.center, gate.position]} pathOptions={{ color: "#6c5ce7", dashArray: "5 7", opacity: 0.55, weight: 3 }}>
              <Popup>{zone.name} · {zone.route.distanceKm} km por vía hacia {gate.name} (OSRM)</Popup>
            </Polyline>
          );
        })}
        {listings.filter((listing) => listing.status !== "rejected").map((listing) => (
          <Marker
            eventHandlers={{ click: () => onSelect?.(listing) }}
            icon={makePinIcon(listing, calendarDay)}
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
          >
            <Popup>
              <strong>{listing.title}</strong><br />
              {listing.sector} · {money(listingPriceBreakdown(listing, calendarDay).total)}/mes<br />
              {statusNames[listing.status]}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {!admin && (
        <div className="map-legend" aria-label="Estado de los alojamientos">
          <span><i className="legend-dot legend-dot--green" /> Disponible</span>
          <span><i className="legend-dot legend-dot--amber" /> En negociación</span>
          <span><i className="legend-dot legend-dot--gray" /> Ocupado</span>
        </div>
      )}
    </div>
  );
}
