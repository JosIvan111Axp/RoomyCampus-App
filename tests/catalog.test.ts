import { describe, expect, it } from "vitest";
import { seedListings, listingPriceBreakdown } from "../src/data";
import { filterAndSortListings, type CatalogFilters } from "../src/catalog";
import { migratePersistedState } from "../src/store";

const defaultFilters: CatalogFilters = {
  category: "Todos",
  calendarDay: 0,
  maxPrice: 1000,
  query: "",
  showSaved: false,
  sortMode: "price",
  wifiOnly: false,
};

describe("student accommodation catalog", () => {
  it("filters by search, modality, budget, wifi, and favorites", () => {
    const results = filterAndSortListings(seedListings, {
      ...defaultFilters,
      category: "Suite",
      favorites: ["ceibos-suite", "urdesa-suite"],
      maxPrice: 200,
      query: "ceibos",
      showSaved: true,
      wifiOnly: true,
    });

    expect(results.map((listing) => listing.id)).toEqual(["ceibos-suite"]);
  });

  it("sorts by monthly total, rating, and walking time", () => {
    const candidates = seedListings.filter((listing) => listing.status === "available");
    const cheapest = filterAndSortListings(candidates, { ...defaultFilters, sortMode: "price" });
    const bestRated = filterAndSortListings(candidates, { ...defaultFilters, sortMode: "rating" });
    const closest = filterAndSortListings(candidates, { ...defaultFilters, sortMode: "distance" });

    expect(cheapest[0].rent).toBeLessThanOrEqual(cheapest[1].rent);
    expect(bestRated[0].rating).toBeGreaterThanOrEqual(bestRated[1].rating);
    expect(closest[0].walkMinutes).toBeLessThanOrEqual(closest[1].walkMinutes);
  });

  it("uses the seasonal total when enforcing the selected budget", () => {
    const results = filterAndSortListings(seedListings, { ...defaultFilters, calendarDay: 21, maxPrice: 150 });

    expect(results.every((listing) => listingPriceBreakdown(listing, 21).total <= 150)).toBe(true);
    expect(results.some((listing) => listing.status === "pending" || listing.status === "rejected")).toBe(false);
  });

  it("migrates older visit records and appends newly added sample listings", () => {
    const migrated = migratePersistedState({
      listings: [seedListings[0]],
      visits: [{ listingId: "ceibos-suite", date: "2026-12-08T12:00:00.000Z" }],
    });

    expect(migrated.visits).toEqual([{
      id: "legacy-visit-0-ceibos-suite",
      listingId: "ceibos-suite",
      date: "2026-12-08",
      studentEmail: "demo@espol.edu.ec",
    }]);
    expect(migrated.listings.length).toBe(seedListings.length);
  });
});
