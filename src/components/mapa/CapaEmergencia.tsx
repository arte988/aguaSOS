"use client";

import { useEffect, useRef } from "react";
import { Popup, type MapLayerMouseEvent } from "maplibre-gl";
import { COLORES_RIESGO, ETIQUETA_NIVEL } from "./colores";
import { useMapRuntime } from "./mapa-contexto";
import type { EmergencyCollection, EmergencyProperties } from "./tipos";

const SOURCE_ID = "v2-emergencies";
const CIRCLE_LAYER_ID = "v2-emergency-circles";
const LABEL_LAYER_ID = "v2-emergency-labels";

function buildEmergencyPopup(feature: {
  properties: EmergencyProperties;
  coordinates: [number, number];
}) {
  const { zoneName, level, risk, activeReports, peopleAffected, calculatedAt } = feature.properties;
  const root = document.createElement("div");
  root.className = "px-1 py-1 text-sm text-slate-900";

  const title = document.createElement("p");
  title.className = "font-semibold";
  title.textContent = zoneName;

  const meta = document.createElement("p");
  meta.className = "mt-1 text-xs";
  meta.textContent = `Nivel: ${ETIQUETA_NIVEL[level]} · Riesgo: ${risk}`;

  const detail = document.createElement("p");
  detail.className = "mt-1 text-xs text-slate-600";
  detail.textContent = `Reportes activos: ${activeReports} · Personas afectadas: ${peopleAffected} · Calculado: ${new Date(calculatedAt).toLocaleString("es-SV")}`;

  root.append(title, meta, detail);

  return new Popup({ closeButton: true, maxWidth: "280px" }).setLngLat(feature.coordinates).setDOMContent(root);
}

export function CapaEmergencia({ data }: { data: EmergencyCollection }) {
  const { map, status, getGeoJsonSource } = useMapRuntime();
  const popupRef = useRef<Popup | null>(null);
  const hasData = data.features.length > 0;

  useEffect(() => {
    if (!map || status !== "ready" || map.getSource(SOURCE_ID)) return;

    map.addSource(SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });

    map.addLayer({
      id: CIRCLE_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "risk"],
          0,
          10,
          100,
          30,
        ],
        "circle-color": [
          "match",
          ["get", "level"],
          "vigilancia",
          COLORES_RIESGO.vigilancia,
          COLORES_RIESGO.emergencia,
        ],
        "circle-opacity": 0.9,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    map.addLayer({
      id: LABEL_LAYER_ID,
      type: "symbol",
      source: SOURCE_ID,
      layout: {
        "text-field": ["get", "zoneName"],
        "text-size": 12,
        "text-offset": [0, -1.4],
        "text-anchor": "bottom",
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      },
      paint: {
        "text-color": [
          "match",
          ["get", "level"],
          "vigilancia",
          COLORES_RIESGO.vigilancia,
          COLORES_RIESGO.emergencia,
        ],
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.5,
      },
    });
  }, [map, status]);

  useEffect(() => {
    if (!map || status !== "ready") return;

    const handleLayerClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const coordinates =
        feature.geometry.type === "Point" ? (feature.geometry.coordinates as [number, number]) : null;
      if (!coordinates) return;
      popupRef.current?.remove();
      popupRef.current = buildEmergencyPopup({
        properties: feature.properties as unknown as EmergencyProperties,
        coordinates,
      }).addTo(map);
    };
    map.on("click", CIRCLE_LAYER_ID, handleLayerClick);

    return () => {
      map.off("click", CIRCLE_LAYER_ID, handleLayerClick);
      popupRef.current?.remove();
      popupRef.current = null;
    };
  }, [map, status]);

  useEffect(() => {
    if (!map || status !== "ready" || !map.getSource(SOURCE_ID)) return;
    const source = getGeoJsonSource(SOURCE_ID);
    if (source) {
      source.setData(data);
    }
  }, [data, getGeoJsonSource, map, status]);

  useEffect(() => {
    if (!map || status !== "ready") return;
    const circle = map.getLayer(CIRCLE_LAYER_ID);
    const label = map.getLayer(LABEL_LAYER_ID);
    if (!circle || !label) return;
    const visibility = hasData ? "visible" : "none";
    if (map.getLayoutProperty(CIRCLE_LAYER_ID, "visibility") !== visibility) {
      map.setLayoutProperty(CIRCLE_LAYER_ID, "visibility", visibility);
    }
    if (map.getLayoutProperty(LABEL_LAYER_ID, "visibility") !== visibility) {
      map.setLayoutProperty(LABEL_LAYER_ID, "visibility", visibility);
    }
  }, [hasData, map, status]);

  return null;
}

export { SOURCE_ID as EMERGENCY_SOURCE_ID, CIRCLE_LAYER_ID as EMERGENCY_CIRCLE_LAYER_ID, LABEL_LAYER_ID as EMERGENCY_LABEL_LAYER_ID };