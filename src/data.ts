export type PropertyStatus = "available" | "reserved" | "occupied" | "pending" | "rejected";
export type PropertyKind = "Suite" | "Cuarto" | "Roomie";

export type Listing = {
  id: string;
  title: string;
  address: string;
  sector: string;
  kind: PropertyKind;
  status: PropertyStatus;
  rent: number;
  utilities: { water: number; power: number; wifi: number };
  area: number;
  bedrooms: number;
  bathrooms: number;
  latitude: number;
  longitude: number;
  walkMinutes: number;
  distanceKm: number;
  verified: boolean;
  reported?: boolean;
  amenities?: string[];
  landlord: string;
  rating: number;
  reviews: number;
  image: string;
  note?: string;
};

export const campusEntrance = { name: "Garita principal ESPOL · referencial", latitude: -2.1467, longitude: -79.9643 };

export const seedListings: Listing[] = [
  {
    id: "ceibos-suite",
    title: "Suite luminosa con patio privado",
    address: "Av. del Bombero, urbanización Los Ceibos",
    sector: "Los Ceibos",
    kind: "Suite",
    status: "available",
    rent: 150,
    utilities: { water: 10, power: 15, wifi: 10 },
    area: 32,
    bedrooms: 1,
    bathrooms: 1,
    latitude: -2.1712,
    longitude: -79.9448,
    walkMinutes: 21,
    distanceKm: 2.4,
    verified: true,
    amenities: ["wifi", "agua"],
    landlord: "María Paredes",
    rating: 4.9,
    reviews: 12,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=960&q=82",
  },
  {
    id: "mapasingue-room",
    title: "Cuarto amoblado cerca del bus",
    address: "Calle 4.ª, Mapasingue Este",
    sector: "Mapasingue",
    kind: "Cuarto",
    status: "available",
    rent: 110,
    utilities: { water: 8, power: 12, wifi: 8 },
    area: 18,
    bedrooms: 1,
    bathrooms: 1,
    latitude: -2.133,
    longitude: -79.948,
    walkMinutes: 16,
    distanceKm: 1.8,
    verified: true,
    amenities: ["wifi"],
    landlord: "Luis Zambrano",
    rating: 4.7,
    reviews: 8,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=960&q=82",
  },
  {
    id: "via-costa-roomie",
    title: "Habitación en depa compartido",
    address: "Vía a la Costa, Urb. Portal al Sol",
    sector: "Vía a la Costa",
    kind: "Roomie",
    status: "available",
    rent: 130,
    utilities: { water: 10, power: 15, wifi: 10 },
    area: 21,
    bedrooms: 1,
    bathrooms: 2,
    latitude: -2.178,
    longitude: -79.975,
    walkMinutes: 27,
    distanceKm: 3.2,
    verified: true,
    amenities: ["wifi", "agua", "luz"],
    landlord: "Andrea Torres",
    rating: 4.8,
    reviews: 15,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=960&q=82",
  },
  {
    id: "ceibos-room",
    title: "Cuarto independiente con escritorio",
    address: "Cdla. Los Ceibos, etapa 3",
    sector: "Los Ceibos",
    kind: "Cuarto",
    status: "reserved",
    rent: 125,
    utilities: { water: 8, power: 12, wifi: 10 },
    area: 20,
    bedrooms: 1,
    bathrooms: 1,
    latitude: -2.163,
    longitude: -79.941,
    walkMinutes: 24,
    distanceKm: 2.8,
    verified: true,
    amenities: ["wifi", "agua"],
    landlord: "Carlos Mendoza",
    rating: 4.6,
    reviews: 6,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=960&q=82",
  },
  {
    id: "urdesa-suite",
    title: "Suite ejecutiva cerca de transporte",
    address: "Av. Víctor Emilio Estrada, Urdesa",
    sector: "Urdesa",
    kind: "Suite",
    status: "available",
    rent: 190,
    utilities: { water: 10, power: 18, wifi: 12 },
    area: 38,
    bedrooms: 1,
    bathrooms: 1,
    latitude: -2.161,
    longitude: -79.902,
    walkMinutes: 54,
    distanceKm: 6.1,
    verified: true,
    amenities: ["wifi", "agua", "luz"],
    landlord: "Sofía Cedeño",
    rating: 4.9,
    reviews: 21,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=960&q=82",
  },
  {
    id: "mapasingue-roomie",
    title: "Roomie tranquilo con área de estudio",
    address: "Mapasingue Oeste, Coop. Colinas del Sol",
    sector: "Mapasingue",
    kind: "Roomie",
    status: "occupied",
    rent: 95,
    utilities: { water: 8, power: 10, wifi: 8 },
    area: 16,
    bedrooms: 1,
    bathrooms: 2,
    latitude: -2.14,
    longitude: -79.951,
    walkMinutes: 18,
    distanceKm: 2.1,
    verified: true,
    amenities: ["wifi"],
    landlord: "Patricia Vera",
    rating: 4.5,
    reviews: 5,
    image: "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=960&q=82",
  },
  {
    id: "ceibos-pending",
    title: "Habitación económica con servicios",
    address: "Calle Primera, Los Ceibos",
    sector: "Los Ceibos",
    kind: "Cuarto",
    status: "pending",
    rent: 90,
    utilities: { water: 6, power: 10, wifi: 8 },
    area: 15,
    bedrooms: 1,
    bathrooms: 1,
    latitude: -2.177,
    longitude: -79.948,
    walkMinutes: 29,
    distanceKm: 3.4,
    verified: false,
    reported: true,
    amenities: ["agua"],
    landlord: "Cuenta por verificar",
    rating: 0,
    reviews: 0,
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=960&q=82",
    note: "Propiedad ficticia marcada para demostrar el flujo de revisión antifraude.",
  },
  {
    id: "mapasingue-pending",
    title: "Cuarto nuevo junto a la línea de bus",
    address: "Coop. Colinas del Sol, Mapasingue Oeste",
    sector: "Mapasingue",
    kind: "Cuarto",
    status: "pending",
    rent: 105,
    utilities: { water: 8, power: 12, wifi: 8 },
    area: 17,
    bedrooms: 1,
    bathrooms: 1,
    latitude: -2.143,
    longitude: -79.944,
    walkMinutes: 19,
    distanceKm: 2.2,
    verified: false,
    amenities: ["wifi", "agua"],
    landlord: "Rafael Quintero",
    rating: 0,
    reviews: 0,
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=960&q=82",
    note: "Propiedad ficticia pendiente de validación documental.",
  },
];

export const listingTotal = (listing: Listing) =>
  listing.rent + listing.utilities.water + listing.utilities.power + listing.utilities.wifi;

export const seasonalPriceFactor = (calendarDay: number) => {
  if (calendarDay >= 21 && calendarDay <= 27) return 1.12;
  return 1 + (Math.floor(calendarDay / 12) % 3) * 0.02;
};

export const listingPriceBreakdown = (listing: Listing, calendarDay: number) => {
  const factor = seasonalPriceFactor(calendarDay);
  const rent = Math.round(listing.rent * factor);
  const water = Math.round(listing.utilities.water * factor);
  const power = Math.round(listing.utilities.power * factor);
  const wifi = Math.round(listing.utilities.wifi * factor);
  return { rent, water, power, wifi, total: rent + water + power + wifi };
};

export const demandMultiplier = (calendarDay: number) =>
  calendarDay >= 21 && calendarDay <= 27 ? 2.7 : 1;

export const academicStart = new Date("2026-03-02T12:00:00");

export const demandHistory = [
  { month: "Oct", regular: 34, matriculation: 48 },
  { month: "Nov", regular: 38, matriculation: 72 },
  { month: "Dic", regular: 31, matriculation: 43 },
  { month: "Ene", regular: 43, matriculation: 87 },
  { month: "Feb", regular: 35, matriculation: 96 },
  { month: "Mar", regular: 41, matriculation: 74 },
  { month: "Abr", regular: 46, matriculation: 53 },
];
