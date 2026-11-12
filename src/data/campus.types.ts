export type CampusZone = {
  id: string;
  name: string;
  center: [number, number];
  polygon: [number, number][];
  approximate?: boolean;
  route?: {
    distanceKm: number;
    durationMinutes: number;
    gateName: string;
    path: [number, number][];
  };
};

export type CampusGate = {
  name: string;
  position: [number, number];
};

export type CampusGeography = {
  source: string;
  generatedAt: string | null;
  gates: CampusGate[];
  zones: CampusZone[];
};
