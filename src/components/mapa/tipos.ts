export type Punto = {
  lat: number;
  lng: number;
  precisionM?: number;
};

export type BoundingBox = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type DateRange = {
  from: string;
  to: string;
};

export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type GeoJsonFeature<Properties> = {
  type: "Feature";
  id?: string;
  geometry: GeoJsonPoint;
  properties: Properties;
};

export type GeoJsonFeatureCollection<Properties> = {
  type: "FeatureCollection";
  features: GeoJsonFeature<Properties>[];
};

export type RiskProperties = {
  reportId: string;
  weight: number;
  createdAt: string;
};

export type EmergencyLevel = "vigilancia" | "emergencia";

export type EmergencyProperties = {
  zoneId: string;
  zoneName: string;
  level: EmergencyLevel;
  risk: number;
  activeReports: number;
  peopleAffected: number;
  calculatedAt: string;
};

export type SupplyType = "embotellada" | "pozo" | "nacimiento" | "tanque" | "donacion";

export type SourceProperties = {
  sourceId: string;
  placeName: string;
  supplyTypes: SupplyType[];
  hasTransport: boolean;
  phone: string;
  available: boolean;
  verified: boolean;
};

export type RiskCollection = GeoJsonFeatureCollection<RiskProperties>;
export type EmergencyCollection = GeoJsonFeatureCollection<EmergencyProperties>;
export type SourceCollection = GeoJsonFeatureCollection<SourceProperties>;

export type CartographyCollections = {
  risk: RiskCollection;
  emergencies: EmergencyCollection;
  sources: SourceCollection;
};

export type CartographyDataOrigin = "fixture" | "convex";
export type CartographyDataStatus = "loading" | "success" | "error";

export type CartographyDataQuery = {
  bbox: BoundingBox;
  dateRange?: DateRange;
};

export type CartographyDataResult = {
  collections: CartographyCollections;
  origin: CartographyDataOrigin;
  status: CartographyDataStatus;
  error?: string;
};

export type CartographyDataSource = {
  origin: CartographyDataOrigin;
  get(query: CartographyDataQuery): CartographyDataResult | Promise<CartographyDataResult>;
};

export type CartographyDataState = CartographyDataResult;

export type SelectorPuntoProps = {
  valor: Punto | null;
  onChange: (point: Punto) => void;
  centroInicial?: Punto;
};

export const EMPTY_COLLECTIONS: CartographyCollections = {
  risk: { type: "FeatureCollection", features: [] },
  emergencies: { type: "FeatureCollection", features: [] },
  sources: { type: "FeatureCollection", features: [] },
};
