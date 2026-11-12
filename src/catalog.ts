import { listingPriceBreakdown, type Listing, type PropertyKind } from "./data";

export type ListingSort = "price" | "rating" | "distance";
export type ListingCategory = "Todos" | PropertyKind;

export type CatalogFilters = {
  category: ListingCategory;
  calendarDay: number;
  favorites?: string[];
  maxPrice: number;
  query: string;
  showSaved: boolean;
  sortMode: ListingSort;
  wifiOnly: boolean;
};

export function filterAndSortListings(listings: Listing[], filters: CatalogFilters): Listing[] {
  const search = filters.query.trim().toLocaleLowerCase();
  return listings
    .filter((listing) => {
      const searchableText = `${listing.title} ${listing.sector} ${listing.address}`.toLocaleLowerCase();
      return listing.status !== "rejected"
        && listing.status !== "pending"
        && listingPriceBreakdown(listing, filters.calendarDay).total <= filters.maxPrice
        && (filters.category === "Todos" || listing.kind === filters.category)
        && (!filters.wifiOnly || listing.amenities?.includes("wifi") === true)
        && (!filters.showSaved || filters.favorites?.includes(listing.id) === true)
        && searchableText.includes(search);
    })
    .sort((a, b) => {
      if (filters.sortMode === "rating") return b.rating - a.rating || a.title.localeCompare(b.title);
      if (filters.sortMode === "distance") return a.walkMinutes - b.walkMinutes || a.title.localeCompare(b.title);
      return listingPriceBreakdown(a, filters.calendarDay).total - listingPriceBreakdown(b, filters.calendarDay).total
        || a.title.localeCompare(b.title);
    });
}
