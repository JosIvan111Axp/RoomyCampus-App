import unittest

from scripts.generate_campus_data import (
    approximate_road_polygon,
    haversine_km,
    polygon_from_osm,
    relation_outer_rings,
)


class CampusGeometryTests(unittest.TestCase):
    def test_stitches_closed_relation_outer_ring(self):
        relation = {
            "type": "relation",
            "members": [
                {"type": "way", "role": "outer", "geometry": [{"lat": 0, "lon": 0}, {"lat": 0, "lon": 1}]},
                {"type": "way", "role": "outer", "geometry": [{"lat": 0, "lon": 1}, {"lat": 1, "lon": 1}, {"lat": 1, "lon": 0}, {"lat": 0, "lon": 0}]},
            ],
        }

        rings, repaired = relation_outer_rings(relation)

        self.assertFalse(repaired)
        self.assertEqual(len(rings), 1)
        self.assertEqual(rings[0][0], rings[0][-1])

    def test_closes_incomplete_relation_and_reports_approximation(self):
        relation = {
            "type": "relation",
            "members": [
                {"type": "way", "role": "outer", "geometry": [{"lat": 0, "lon": 0}, {"lat": 0, "lon": 1}, {"lat": 1, "lon": 1}]},
            ],
        }

        rings, repaired = relation_outer_rings(relation)

        self.assertTrue(repaired)
        self.assertEqual(rings[0][0], rings[0][-1])

    def test_road_corridor_is_closed_and_marked_approximate(self):
        polygon, approximate = polygon_from_osm(
            {
                "type": "way",
                "geometry": [
                    {"lat": -2.0, "lon": -79.0},
                    {"lat": -2.01, "lon": -79.01},
                    {"lat": -2.02, "lon": -79.02},
                    {"lat": -2.03, "lon": -79.03},
                ],
            }
        )

        self.assertTrue(approximate)
        self.assertGreaterEqual(len(polygon[0]), 4)
        self.assertEqual(polygon[0][0], polygon[0][-1])

    def test_haversine_returns_reasonable_city_distance(self):
        self.assertAlmostEqual(haversine_km((-2.1467, -79.9643), (-2.1467, -79.9543)), 1.11, delta=0.05)


if __name__ == "__main__":
    unittest.main()
