import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedListings, type Listing, type PropertyStatus } from "./data";

type UserRole = "student" | "admin";
type Visit = { listingId: string; date: string };
type DemoState = {
  listings: Listing[];
  favorites: string[];
  visits: Visit[];
  email: string;
  role: UserRole | null;
  calendarDay: number;
  speed: 1 | 3 | 10;
  demoOpen: boolean;
  contactsThisMonth: number;
  fraudReports: number;
  authenticate: (email: string, role: UserRole) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  scheduleVisit: (id: string) => void;
  reserveListing: (id: string) => void;
  contactLandlord: () => void;
  advanceCalendar: () => void;
  setCalendarDay: (day: number) => void;
  setSpeed: (speed: 1 | 3 | 10) => void;
  toggleDemo: () => void;
  setDemoOpen: (open: boolean) => void;
  occupyAvailable: () => void;
  injectFraud: () => void;
  approveNext: () => void;
  resetDemo: () => void;
  importSyncedState: (state: PersistedState) => void;
};

type PersistedState = Pick<
  DemoState,
  "listings" | "favorites" | "visits" | "calendarDay" | "speed" | "contactsThisMonth" | "fraudReports"
>;

const identityStorageKey = "roomycampus-identity-v1";

function readSessionIdentity(): Pick<DemoState, "email" | "role"> {
  if (typeof window === "undefined") return { email: "", role: null };
  const saved = window.sessionStorage.getItem(identityStorageKey);
  if (!saved) return { email: "", role: null };
  try {
    const identity = JSON.parse(saved) as { email?: unknown; role?: unknown };
    if (typeof identity.email === "string" && (identity.role === "student" || identity.role === "admin")) {
      return { email: identity.email, role: identity.role };
    }
    throw new Error("La identidad guardada en esta pestaña no es válida.");
  } catch (error) {
    console.error("No se pudo recuperar el acceso de demostración de esta pestaña.", error);
    window.sessionStorage.removeItem(identityStorageKey);
    return { email: "", role: null };
  }
}

const initialSharedState: PersistedState = {
  listings: seedListings,
  favorites: [],
  visits: [],
  calendarDay: 0,
  speed: 1,
  contactsThisMonth: 0,
  fraudReports: 0,
};

function dateUpdate(listings: Listing[], currentDay: number, nextDay: number) {
  const enteredEnrollmentWeek = currentDay < 21 && nextDay >= 21;
  if (!enteredEnrollmentWeek) return { listings, calendarDay: nextDay };
  let reserved = false;
  return {
    calendarDay: nextDay,
    listings: listings.map((listing) => {
      if (!reserved && listing.status === "available") {
        reserved = true;
        return { ...listing, status: "reserved" as const };
      }
      return listing;
    }),
  };
}

const initialState = {
  ...initialSharedState,
  ...readSessionIdentity(),
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      ...initialState,
      demoOpen: false,
      authenticate: (email, role) => {
        window.sessionStorage.setItem(identityStorageKey, JSON.stringify({ email, role }));
        set({ email, role });
      },
      logout: () => {
        window.sessionStorage.removeItem(identityStorageKey);
        set({ email: "", role: null });
      },
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((favorite) => favorite !== id)
            : [...state.favorites, id],
        })),
      scheduleVisit: (id) =>
        set((state) => ({
          visits: [...state.visits, { listingId: id, date: new Date().toISOString() }],
        })),
      reserveListing: (id) =>
        set((state) => ({
          listings: state.listings.map((listing) =>
            listing.id === id && listing.status === "available"
              ? { ...listing, status: "occupied" as const }
              : listing,
          ),
        })),
      contactLandlord: () => set((state) => ({ contactsThisMonth: state.contactsThisMonth + 1 })),
      advanceCalendar: () =>
        set((state) => dateUpdate(state.listings, state.calendarDay, state.calendarDay + state.speed)),
      setCalendarDay: (calendarDay) =>
        set((state) => dateUpdate(state.listings, state.calendarDay, calendarDay)),
      setSpeed: (speed) => set({ speed }),
      toggleDemo: () => set((state) => ({ demoOpen: !state.demoOpen })),
      setDemoOpen: (demoOpen) => set({ demoOpen }),
      occupyAvailable: () =>
        set((state) => {
          let occupied = 0;
          return {
            listings: state.listings.map((listing) => {
              if (listing.status === "available" && occupied < 3) {
                occupied += 1;
                return { ...listing, status: "occupied" as const };
              }
              return listing;
            }),
          };
        }),
      injectFraud: () =>
        set((state) => {
          if (state.listings.some((listing) => listing.id === "demo-fraud")) return state;
          const sample = seedListings[0];
          return {
            listings: [
              {
                ...sample,
                id: "demo-fraud",
                title: "¡Oportunidad única! Adelanto urgente",
                address: "Ubicación no verificable · sector Los Ceibos",
                sector: "Los Ceibos",
                rent: 55,
                status: "pending",
                verified: false,
                reported: true,
                landlord: "Cuenta nueva · sin identidad validada",
                rating: 0,
                reviews: 0,
                note: "AVISO FICTICIO PARA LA DEMO: sospechoso, sin identidad ni contrato verificables.",
              },
              ...state.listings,
            ],
          };
        }),
      approveNext: () =>
        set((state) => {
          const next = state.listings.find(
            (listing) => listing.status === "pending" && !listing.reported,
          );
          if (!next) return state;
          return {
            listings: state.listings.map((listing) =>
              listing.id === next.id
                ? { ...listing, status: "available" as const, verified: true }
                : listing,
            ),
          };
        }),
      resetDemo: () => set((state) => ({ ...initialSharedState, email: state.email, role: state.role, demoOpen: state.demoOpen })),
      importSyncedState: (syncedState) =>
        set((state) => ({
          ...syncedState,
          email: state.email,
          role: state.role,
          demoOpen: state.demoOpen,
        })),
    }),
    {
      name: "roomycampus-demo-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          listings: state.listings,
          favorites: state.favorites,
          visits: state.visits,
          calendarDay: state.calendarDay,
          speed: state.speed,
          contactsThisMonth: state.contactsThisMonth,
          fraudReports: state.fraudReports,
        }) as PersistedState,
    },
  ),
);

const persistedKeys = new Set<keyof PersistedState>([
  "listings",
  "favorites",
  "visits",
  "calendarDay",
  "speed",
  "contactsThisMonth",
  "fraudReports",
]);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "roomycampus-demo-v2" || !event.newValue) return;
    try {
      const saved = JSON.parse(event.newValue) as { state?: Record<string, unknown> };
      if (!saved.state) throw new Error("El estado compartido no contiene la propiedad state.");
      const state = Object.fromEntries(
        Object.entries(saved.state).filter(([key]) => persistedKeys.has(key as keyof PersistedState)),
      ) as Partial<PersistedState>;
      useDemoStore.getState().importSyncedState({ ...initialSharedState, ...state });
    } catch (error) {
      console.error("No se pudo sincronizar el estado de RoomyCampus entre pestañas.", error);
    }
  });
}

export type DemoStoreState = DemoState;
export type ListingUpdateStatus = PropertyStatus;
