"use client";

import { useEffect, useRef } from "react";
import { Popup, type MapLayerMouseEvent } from "maplibre-gl";
import { COLOR_FUENTES, ETIQUETA_SUMINISTRO } from "./colores";
import { useMapRuntime } from "./mapa-contexto";
import type { SourceCollection, SourceProperties } from "./tipos";

const SOURCE_ID = "v2-sources";
const LAYER_ID = "v2-source-dots";

export function normalizePhone(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, "");
  if (!digits || !/^\+?\d{6,15}$/.test(digits)) return null;
  return digits;
}

function buildSourcePopup(feature: {
  properties: SourceProperties;
  coordinates: [number, number];
}) {
  const { placeName, supplyTypes, hasTransport, phone } = feature.properties;
  const root = document.createElement("div");
  root.className = "px-1 py-1 text-sm text-slate-900";

  const title = document.createElement("p");
  title.className = "font-semibold";
  title.textContent = placeName;
  const meta = document.createElement("p");
  meta.className = "mt-1 text-xs text-slate-600";
  meta.textContent = `${supplyTypes.map((type) => ETIQUETA_SUMINISTRO[type]).join(" · ")} · ${
    hasTransport ? "Con transporte" : "Sin transporte"
  }`;

  root.append(title, meta);

  const normalized = normalizePhone(phone);
  if (normalized) {
    const action = document.createElement("a");
    action.href = `tel:${normalized}`;
    action.textContent = `Llamar ${phone}`;
    action.className =
      "mt-2 inline-flex min-h-11 min-w-11 items-center rounded-lg bg-sky-800 px-3 font-semibold text-white";
    root.append(action);
  } else {
    const phoneLine = document.createElement("p");
    phoneLine.className = "mt-2 text-xs";
    phoneLine.textContent = `Teléfono: ${phone}`;
    root.append(phoneLine);
  }

  const popup = new Popup({ closeButton: true, maxWidth: "280px" })
    .setLngLat(feature.coordinates)
    .setDOMContent(root);

  return { popup, placeName };
}

export function CapaFuentes({
  data,
  onPopupOpen,
}: {
  data: SourceCollection;
  onPopupOpen?: (placeName: string) => void;
}) {
  const { map, status, getGeoJsonSource } = useMapRuntime();
  const popupRef = useRef<Popup | null>(null);
  const openRef = useRef(onPopupOpen);
  const hasData = data.features.length > 0;

  useEffect(() => {
    openRef.current = onPopupOpen;
  }, [onPopupOpen]);

  useEffect(() => {
    if (!map || status !== "ready" || map.getSource(SOURCE_ID)) return;

    map.addSource(SOURCE_ID, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({
      id: LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": 7,
        "circle-color": COLOR_FUENTES,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }, [map, status]);

  useEffect(() => {
    if (!map || status !== "ready") return;

    const handleLayerClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      popupRef.current?.remove();
      const coordinates = feature.geometry.type === "Point" ? (feature.geometry.coordinates as [number, number]) : null;
      if (!coordinates) return;
      const properties = feature.properties as unknown as SourceProperties;
      const { popup, placeName } = buildSourcePopup({ properties, coordinates });
      popupRef.current = popup.addTo(map);
      openRef.current?.(placeName);
    };
    const clearCursor = () => map.getCanvas().style.removeProperty("cursor");
    const setCursor = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    map.on("click", LAYER_ID, handleLayerClick);
    map.on("mouseenter", LAYER_ID, setCursor);
    map.on("mouseleave", LAYER_ID, clearCursor);

    return () => {
      map.off("click", LAYER_ID, handleLayerClick);
      map.off("mouseenter", LAYER_ID, setCursor);
      map.off("mouseleave", LAYER_ID, clearCursor);
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
    if (!map || status !== "ready" || !map.getLayer(LAYER_ID)) return;
    const visibility = hasData ? "visible" : "none";
    if (map.getLayoutProperty(LAYER_ID, "visibility") !== visibility) {
      map.setLayoutProperty(LAYER_ID, "visibility", visibility);
    }
  }, [hasData, map, status]);

  return null;
}

export { SOURCE_ID as SOURCES_SOURCE_ID, LAYER_ID as SOURCES_LAYER_ID };