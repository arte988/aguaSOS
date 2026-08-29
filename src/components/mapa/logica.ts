import type {
  BoundingBox,
  CartographyCollections,
  DateRange,
  EmergencyCollection,
  GeoJsonFeature,
  GeoJsonPoint,
  Punto,
  RiskCollection,
  RiskProperties,
  SourceCollection,
} from "./tipos";

export const EL_SALVADOR_OFFSET = "-06:00";
const EL_SALVADOR_OFFSET_MS = -6 * 60 * 60 * 1000;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export type CartographyFilterOptions = {
  bbox: BoundingBox;
  dateRange?: DateRange;
};

export function geoJsonToPoint(point: GeoJsonPoint) {
  const [lng, lat] = point.coordinates;
  return { lat, lng };
}

export type VectorCoordenadas = { lat: string; lng: string };

export type ResultadoVector =
  | { tipo: "vacio" }
  | { tipo: "parcial" }
  | { tipo: "invalido" }
  | { tipo: "fuera"; punto: Punto }
  | { tipo: "punto"; punto: Punto };

export function interpretarVector(
  vector: VectorCoordenadas,
  limites: BoundingBox,
): ResultadoVector {
  const lat = Number(vector.lat);
  const lng = Number(vector.lng);
  const latOk =
    vector.lat.trim() !== "" && Number.isFinite(lat) && lat >= -90 && lat <= 90;
  const lngOk =
    vector.lng.trim() !== "" && Number.isFinite(lng) && lng >= -180 && lng <= 180;

  if (vector.lat.trim() === "" && vector.lng.trim() === "") return { tipo: "vacio" };
  if (vector.lat.trim() === "" || vector.lng.trim() === "") return { tipo: "parcial" };
  if (!latOk || !lngOk) return { tipo: "invalido" };

  const punto = { lat, lng };
  return pointInBoundingBox({ type: "Point", coordinates: [lng, lat] }, limites)
    ? { tipo: "punto", punto }
    : { tipo: "fuera", punto };
}

export function parseRangoUrl(
  params: URLSearchParams,
  defecto: DateRange,
): DateRange {
  const from = params.get("desde");
  const to = params.get("hasta");
  return {
    from: from && isDateKey(from) ? from : defecto.from,
    to: to && isDateKey(to) ? to : defecto.to,
  };
}

export type CapasUrl = { riesgo: boolean; emergencia: boolean; fuentes: boolean };

export function parseCapasUrl(params: URLSearchParams): CapasUrl {
  return {
    riesgo: (params.get("riesgo") ?? "1") === "1",
    emergencia: (params.get("emergencia") ?? "1") === "1",
    fuentes: (params.get("fuentes") ?? "1") === "1",
  };
}

export function pointInBoundingBox(
  point: GeoJsonPoint,
  bbox: BoundingBox,
): boolean {
  const [lng, lat] = point.coordinates;
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= bbox.west &&
    lng <= bbox.east &&
    lat >= bbox.south &&
    lat <= bbox.north
  );
}

export function normalizeDateRange(dateRange: DateRange) {
  assertDateKey(dateRange.from);
  assertDateKey(dateRange.to);

  if (dateRange.from <= dateRange.to) {
    return { range: dateRange, inverted: false };
  }

  return {
    range: { from: dateRange.to, to: dateRange.from },
    inverted: true,
  };
}

export function dateRangeToEpoch(dateRange: DateRange) {
  const normalized = normalizeDateRange(dateRange).range;
  return {
    from: Date.parse(`${normalized.from}T00:00:00.000${EL_SALVADOR_OFFSET}`),
    to: Date.parse(`${normalized.to}T23:59:59.999${EL_SALVADOR_OFFSET}`),
  };
}

export function dateKeyInElSalvador(value: Date): string {
  return new Date(value.getTime() + EL_SALVADOR_OFFSET_MS).toISOString().slice(0, 10);
}

export function shiftDateKey(value: string, days: number): string {
  assertDateKey(value);
  const [year, month, day] = value.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

export function defaultDateRange(now = new Date()): DateRange {
  const to = dateKeyInElSalvador(now);
  return { from: shiftDateKey(to, -29), to };
}

export function applyCartographyFilters(
  collections: CartographyCollections,
  options: CartographyFilterOptions,
): CartographyCollections {
  const bounds = options.dateRange ? dateRangeToEpoch(options.dateRange) : null;

  return {
    risk: filterRisk(collections.risk, options.bbox, bounds),
    emergencies: filterEmergencies(collections.emergencies, options.bbox, bounds),
    sources: filterSources(collections.sources, options.bbox),
  };
}

function filterRisk(
  collection: RiskCollection,
  bbox: BoundingBox,
  bounds: { from: number; to: number } | null,
): RiskCollection {
  return {
    ...collection,
    features: collection.features.filter((feature) => {
      if (!pointInBoundingBox(feature.geometry, bbox)) return false;
      return bounds ? isWithinRange(feature.properties.createdAt, bounds) : true;
    }),
  };
}

function filterEmergencies(
  collection: EmergencyCollection,
  bbox: BoundingBox,
  bounds: { from: number; to: number } | null,
): EmergencyCollection {
  return {
    ...collection,
    features: collection.features.filter((feature) => {
      if (!pointInBoundingBox(feature.geometry, bbox)) return false;
      return bounds ? isWithinRange(feature.properties.calculatedAt, bounds) : true;
    }),
  };
}

function filterSources(collection: SourceCollection, bbox: BoundingBox): SourceCollection {
  return {
    ...collection,
    features: collection.features.filter(
      (feature) =>
        feature.properties.available &&
        feature.properties.verified &&
        pointInBoundingBox(feature.geometry, bbox),
    ),
  };
}

function isWithinRange(isoDate: string, bounds: { from: number; to: number }) {
  const time = Date.parse(isoDate);
  return Number.isFinite(time) && time >= bounds.from && time <= bounds.to;
}

export function isDateKey(value: string): boolean {
  return DATE_KEY.test(value) && isCalendarDate(value);
}

function assertDateKey(value: string) {
  if (!isDateKey(value)) {
    throw new RangeError(`Fecha inválida: ${value}`);
  }
}

function isCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value;
}

export type ReporteParaRiesgo = {
  reporteId: string;
  lat: number;
  lng: number;
  personasRango: "1-5" | "6-20" | "21-100" | "101-500" | "500+";
  impacto: "casa" | "pasaje" | "comunidad";
  creadoEn: number;
};

const PESO_POR_RANGO: Record<ReporteParaRiesgo["personasRango"], number> = {
  "1-5": 2,
  "6-20": 5,
  "21-100": 12,
  "101-500": 20,
  "500+": 35,
};

const MULTIPLICADOR_IMPACTO: Record<ReporteParaRiesgo["impacto"], number> = {
  casa: 1,
  pasaje: 1.2,
  comunidad: 1.5,
};

/** Peso para el heatmap, alineado con la escala fija de CapaRiesgo (máx. 60). */
export function pesoDesdeReporte(reporte: ReporteParaRiesgo): number {
  const base = PESO_POR_RANGO[reporte.personasRango];
  return Math.min(60, Math.round(base * MULTIPLICADOR_IMPACTO[reporte.impacto]));
}

export function mezclarReporteEnRiesgo(
  collection: RiskCollection,
  reporte: ReporteParaRiesgo | null,
): RiskCollection {
  if (!reporte) return collection;

  const feature: GeoJsonFeature<RiskProperties> = {
    type: "Feature",
    id: reporte.reporteId,
    geometry: { type: "Point", coordinates: [reporte.lng, reporte.lat] },
    properties: {
      reportId: reporte.reporteId,
      weight: pesoDesdeReporte(reporte),
      createdAt: new Date(reporte.creadoEn).toISOString(),
    },
  };

  const sinDuplicado = collection.features.filter(
    (item) => item.properties.reportId !== reporte.reporteId,
  );

  return { type: "FeatureCollection", features: [feature, ...sinDuplicado] };
}


