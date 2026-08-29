import assert from "node:assert/strict";
import test from "node:test";
import {
  applyCartographyFilters,
  geoJsonToPoint,
  interpretarVector,
  isDateKey,
  normalizeDateRange,
  parseCapasUrl,
  parseRangoUrl,
  mezclarReporteEnRiesgo,
  pesoDesdeReporte,
// @ts-expect-error Node 22 runs this test directly from TypeScript and needs the extension.
} from "./logica.ts";
import type {
  CartographyCollections,
  DateRange,
  GeoJsonFeature,
  GeoJsonPoint,
  RiskProperties,
  SourceProperties,
} from "./tipos";

const bbox = { west: -89.1, south: 13.5, east: -88.5, north: 14.1 };
const point = (id: string, coordinates: [number, number], createdAt: string): GeoJsonFeature<RiskProperties> => ({
  type: "Feature",
  id,
  geometry: { type: "Point", coordinates },
  properties: { reportId: id, weight: 10, createdAt },
});

const source = (
  id: string,
  available: boolean,
  verified: boolean,
): GeoJsonFeature<SourceProperties> => ({
  type: "Feature",
  id,
  geometry: { type: "Point", coordinates: [-88.8, 13.8] },
  properties: {
    sourceId: id,
    placeName: id,
    supplyTypes: ["pozo"],
    hasTransport: false,
    phone: "2222-2222",
    available,
    verified,
  },
});

function collections(riskFeatures: GeoJsonFeature<RiskProperties>[], sources: GeoJsonFeature<SourceProperties>[]): CartographyCollections {
  return {
    risk: { type: "FeatureCollection", features: riskFeatures },
    emergencies: { type: "FeatureCollection", features: [] },
    sources: { type: "FeatureCollection", features: sources },
  };
}

const range: DateRange = { from: "2026-01-01", to: "2026-01-03" };

test("incluye ambos extremos del rango de fechas en hora de El Salvador", () => {
  const result = applyCartographyFilters(
    collections(
      [
        point("before", [-88.8, 13.8], "2025-12-31T23:59:59.999-06:00"),
        point("start", [-88.8, 13.8], "2026-01-01T00:00:00-06:00"),
        point("end", [-88.8, 13.8], "2026-01-03T23:59:59.999-06:00"),
        point("after", [-88.8, 13.8], "2026-01-04T00:00:00-06:00"),
      ],
      [],
    ),
    { bbox, dateRange: range },
  );

  assert.deepEqual(
    result.risk.features.map((feature) => feature.id),
    ["start", "end"],
  );
});

test("normaliza un rango invertido y deja constancia de la corrección", () => {
  assert.deepEqual(normalizeDateRange({ from: "2026-01-10", to: "2026-01-01" }), {
    range: { from: "2026-01-01", to: "2026-01-10" },
    inverted: true,
  });
});

test("conserva puntos interiores y elimina puntos exteriores del bounding box", () => {
  const result = applyCartographyFilters(
    collections(
      [
        point("inside", [-88.8, 13.8], "2026-01-02T12:00:00-06:00"),
        point("outside", [-90, 13.8], "2026-01-02T12:00:00-06:00"),
      ],
      [],
    ),
    { bbox, dateRange: range },
  );

  assert.deepEqual(result.risk.features.map((feature) => feature.id), ["inside"]);
});

test("no expone una fuente no disponible o no verificada", () => {
  const result = applyCartographyFilters(
    collections([], [source("available", true, true), source("offline", false, true), source("unverified", true, false)]),
    { bbox },
  );

  assert.deepEqual(result.sources.features.map((feature) => feature.id), ["available"]);
});

test("convierte coordenadas GeoJSON [longitud, latitud] al punto de UI", () => {
  const geoJsonPoint: GeoJsonPoint = { type: "Point", coordinates: [-88.123, 13.987] };
  assert.deepEqual(geoJsonToPoint(geoJsonPoint), { lng: -88.123, lat: 13.987 });
});

test("reconoce claves de fecha válidas y rechaza basura sin lanzar", () => {
  assert.equal(isDateKey("2026-01-31"), true);
  assert.equal(isDateKey("2026-02-29"), false); // 2026 no es bisiesto
  assert.equal(isDateKey("2026/01/31"), false);
  assert.equal(isDateKey("31-01-2026"), false);
  assert.equal(isDateKey("basura"), false);
});

test("el rango de URL cae a los valores por defecto ante ausencia o fechas inválidas", () => {
  const defecto: DateRange = { from: "2026-07-01", to: "2026-07-30" };
  assert.deepEqual(parseRangoUrl(new URLSearchParams(), defecto), defecto);
  assert.deepEqual(
    parseRangoUrl(new URLSearchParams({ desde: "basura", hasta: "2026-02-30" }), defecto),
    defecto,
  );
  assert.deepEqual(
    parseRangoUrl(new URLSearchParams({ desde: "2026-07-05" }), defecto),
    { from: "2026-07-05", to: "2026-07-30" },
  );
});

test("las capas de URL responden a toggles y por defecto están todas visibles", () => {
  assert.deepEqual(parseCapasUrl(new URLSearchParams()), { riesgo: true, emergencia: true, fuentes: true });
  assert.deepEqual(parseCapasUrl(new URLSearchParams({ riesgo: "0", fuentes: "0" })), {
    riesgo: false,
    emergencia: true,
    fuentes: false,
  });
});

test("el selector interpreta borradores: vacío, parcial, inválido, punto y fuera de límites", () => {
  const limites = { west: -90.2, south: 12.8, east: -87.6, north: 14.6 };
  assert.deepEqual(interpretarVector({ lat: "", lng: "" }, limites), { tipo: "vacio" });
  assert.deepEqual(interpretarVector({ lat: "13.7", lng: "" }, limites), { tipo: "parcial" });
  assert.deepEqual(interpretarVector({ lat: "91", lng: "-88.9" }, limites), { tipo: "invalido" });
  assert.deepEqual(interpretarVector({ lat: "13.7", lng: "-88.9" }, limites), {
    tipo: "punto",
    punto: { lat: 13.7, lng: -88.9 },
  });
  assert.deepEqual(interpretarVector({ lat: "12.0", lng: "-95.0" }, limites), {
    tipo: "fuera",
    punto: { lat: 12, lng: -95 },
  });
});

test("una corrección manual emite un punto sin precisión GPS", () => {
  const limites = { west: -90.2, south: 12.8, east: -87.6, north: 14.6 };
  const resultado = interpretarVector({ lat: "13.7942", lng: "-88.8965" }, limites);
  assert.equal(resultado.tipo, "punto");
  if (resultado.tipo === "punto") {
    assert.equal("precisionM" in resultado.punto, false);
  }
});

test("mezclarReporteEnRiesgo añade el reporte recién enviado al heatmap", () => {
  const base = collections([point("demo-1", [-89.0, 13.7], "2026-08-01T12:00:00-06:00")], []);
  const reporte = {
    reporteId: "nuevo-1",
    lat: 13.71,
    lng: -89.15,
    personasRango: "6-20" as const,
    impacto: "pasaje" as const,
    creadoEn: Date.parse("2026-08-29T12:00:00-06:00"),
  };

  assert.equal(pesoDesdeReporte(reporte), 6);

  const mezclado = mezclarReporteEnRiesgo(base.risk, reporte);
  assert.equal(mezclado.features.length, 2);
  assert.equal(mezclado.features[0]?.properties.reportId, "nuevo-1");
  assert.equal(mezclado.features[0]?.properties.weight, 6);
});

test("mezclarReporteEnRiesgo reemplaza un reporte con el mismo id", () => {
  const base = collections([point("dup", [-89.0, 13.7], "2026-08-01T12:00:00-06:00")], []);
  const reporte = {
    reporteId: "dup",
    lat: 13.8,
    lng: -88.9,
    personasRango: "500+" as const,
    impacto: "comunidad" as const,
    creadoEn: Date.now(),
  };

  const mezclado = mezclarReporteEnRiesgo(base.risk, reporte);
  assert.equal(mezclado.features.length, 1);
  assert.equal(mezclado.features[0]?.geometry.coordinates[1], 13.8);
});
