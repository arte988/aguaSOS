"use client";

import { useEffect } from "react";
import { useMapRuntime } from "./mapa-contexto";
import type { RiskCollection } from "./tipos";

const SOURCE_ID = "v2-risk";
const LAYER_ID = "v2-risk-heat";

export function CapaRiesgo({ data }: { data: RiskCollection }) {
  const { map, status, getGeoJsonSource } = useMapRuntime();
  const hasData = data.features.length > 0;

  useEffect(() => {
    if (!map || status !== "ready") return;

    if (map.getSource(SOURCE_ID)) {
      return;
    }

    map.addSource(SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({
      id: LAYER_ID,
      type: "heatmap",
      source: SOURCE_ID,
      paint: {
        // Escala fija según spec: peso 0 → 0, 5 → 0.25, 20 → 0.65, 60+ → 1.
        // No se normaliza contra el máximo visible; la leyenda la repite.
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "weight"],
          0,
          0,
          5,
          0.25,
          20,
          0.65,
          60,
          1,
        ],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 2.5],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 0, 0, 0)",
          0.1,
          "#38bdf8",
          0.35,
          "#fde047",
          0.6,
          "#fb923c",
          0.8,
          "#ef4444",
          1,
          "#dc2626",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 14, 14, 34],
        "heatmap-opacity": 0.85,
      },
    });
  }, [map, status]);

  useEffect(() => {
    if (!map || status !== "ready" || !map.getSource(SOURCE_ID)) return;
    const source = getGeoJsonSource(SOURCE_ID);
    if (source) {
      source.setData(data);
    }
  }, [data, getGeoJsonSource, map, status]);

  // Heatmap layers need empty data to render nothing at all.
  useEffect(() => {
    if (!map || status !== "ready") return;
    if (!hasData && map.getLayer(LAYER_ID)) {
      map.setLayoutProperty(LAYER_ID, "visibility", "none");
      return;
    }
    if (hasData && map.getLayer(LAYER_ID)) {
      map.setLayoutProperty(LAYER_ID, "visibility", "visible");
    }
  }, [hasData, map, status]);

  return null;
}

export { SOURCE_ID as RISK_SOURCE_ID, LAYER_ID as RISK_LAYER_ID };