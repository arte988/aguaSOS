import { dateKeyInElSalvador, shiftDateKey } from "./logica";
import type {
  CartographyCollections,
  EmergencyLevel,
  GeoJsonFeature,
  RiskProperties,
  SourceProperties,
} from "./tipos";

function risk(
  id: string,
  coordinates: [number, number],
  weight: number,
  createdAt: string,
): GeoJsonFeature<RiskProperties> {
  return {
    type: "Feature",
    id,
    geometry: { type: "Point", coordinates },
    properties: { reportId: id, weight, createdAt },
  };
}

function source(
  id: string,
  coordinates: [number, number],
  properties: Omit<SourceProperties, "sourceId">,
): GeoJsonFeature<SourceProperties> {
  return {
    type: "Feature",
    id,
    geometry: { type: "Point", coordinates },
    properties: { sourceId: id, ...properties },
  };
}

function relativeDate(now: Date, daysAgo: number, time = "12:00:00") {
  const today = dateKeyInElSalvador(now);
  return `${shiftDateKey(today, -daysAgo)}T${time}-06:00`;
}

function alert(
  id: string,
  zoneName: string,
  level: EmergencyLevel,
  riskValue: number,
  activeReports: number,
  peopleAffected: number,
  coordinates: [number, number],
  calculatedAt: string,
): CartographyCollections["emergencies"]["features"][number] {
  return {
    type: "Feature",
    id,
    geometry: { type: "Point", coordinates },
    properties: {
      zoneId: id,
      zoneName,
      level,
      risk: riskValue,
      activeReports,
      peopleAffected,
      calculatedAt,
    },
  };
}

export function createDemoCollections(now = new Date()): CartographyCollections {
  return {
    risk: {
      type: "FeatureCollection",
      features: [
        risk("demo-report-1", [-89.2037, 13.6929], 2, relativeDate(now, 21)),
        risk("demo-report-2", [-89.1502, 13.7103], 5, relativeDate(now, 14)),
        risk("demo-report-3", [-89.29, 13.68], 12, relativeDate(now, 7)),
        risk("demo-report-4", [-88.18, 13.48], 20, relativeDate(now, 3)),
        risk("demo-report-5", [-88.43, 13.35], 35, relativeDate(now, 1)),
        risk("demo-report-6", [-87.72, 14.42], 65, relativeDate(now, 0)),
        risk("demo-report-old", [-89.1, 13.75], 60, relativeDate(now, 40)),
        risk("demo-report-outside", [-91.0, 14.0], 20, relativeDate(now, 0)),
      ],
    },
    emergencies: {
      type: "FeatureCollection",
      features: [
        alert(
          "demo-zone-ss",
          "Distrito Centro",
          "vigilancia",
          32,
          8,
          120,
          [-89.2037, 13.6929],
          relativeDate(now, 2, "09:30:00"),
        ),
        alert(
          "demo-zone-sa",
          "Distrito Norte",
          "emergencia",
          78,
          15,
          380,
          [-89.56, 13.99],
          relativeDate(now, 5, "15:00:00"),
        ),
        alert(
          "demo-zone-sm",
          "Distrito Oriente",
          "vigilancia",
          48,
          6,
          90,
          [-88.18, 13.48],
          relativeDate(now, 18, "08:00:00"),
        ),
        alert(
          "demo-zone-outside",
          "Zona fuera de vista",
          "emergencia",
          91,
          20,
          500,
          [-87.5, 14.2],
          relativeDate(now, 1),
        ),
      ],
    },
    sources: {
      type: "FeatureCollection",
      features: [
        source("demo-source-1", [-89.21, 13.7], {
          placeName: "Pozo comunitario <El Pino>",
          supplyTypes: ["pozo", "embotellada"],
          hasTransport: true,
          phone: "+503 2222-1100",
          available: true,
          verified: true,
        }),
        source("demo-source-2", [-89.12, 13.72], {
          placeName: "Agua Viva - tanque central",
          supplyTypes: ["tanque", "donacion"],
          hasTransport: false,
          phone: "2277-4501",
          available: true,
          verified: true,
        }),
        source("demo-source-3", [-88.19, 13.48], {
          placeName: "Nacimiento La Esperanza",
          supplyTypes: ["nacimiento"],
          hasTransport: true,
          phone: "7940 2210",
          available: true,
          verified: true,
        }),
        source("demo-source-unavailable", [-89.2, 13.69], {
          placeName: "Fuente temporal cerrada",
          supplyTypes: ["embotellada"],
          hasTransport: false,
          phone: "2222-0000",
          available: false,
          verified: true,
        }),
        source("demo-source-unverified", [-89.2, 13.69], {
          placeName: "Fuente pendiente de verificación",
          supplyTypes: ["pozo"],
          hasTransport: false,
          phone: "2222-0001",
          available: true,
          verified: false,
        }),
        source("demo-source-outside", [-87.5, 14.2], {
          placeName: "Fuente fuera de vista",
          supplyTypes: ["donacion"],
          hasTransport: true,
          phone: "2222-0002",
          available: true,
          verified: true,
        }),
      ],
    },
  };
}

export const DEMO_COLLECTIONS = createDemoCollections();
