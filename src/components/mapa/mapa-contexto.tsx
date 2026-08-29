"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";

export type MapStatus = "loading" | "ready" | "error";

export type MapRuntime = {
  map: MapLibreMap | null;
  status: MapStatus;
  tileError: string | null;
  getGeoJsonSource: (sourceId: string) => GeoJSONSource | undefined;
};

const MapRuntimeContext = createContext<MapRuntime | null>(null);

export function MapRuntimeProvider({ value, children }: { value: MapRuntime; children: ReactNode }) {
  return <MapRuntimeContext.Provider value={value}>{children}</MapRuntimeContext.Provider>;
}

export function useMapRuntime() {
  const runtime = useContext(MapRuntimeContext);
  if (!runtime) {
    throw new Error("Las capas cartográficas deben estar dentro de MapaBase.");
  }
  return runtime;
}

// ponytail: MapLibre types getSource as the generic `Source` base; the GeoJSON
// cast lives here so layers and the selector share one conversion point.
export function getGeoJsonSource(map: MapLibreMap | null, sourceId: string): GeoJSONSource | undefined {
  const source = map?.getSource<GeoJSONSource>(sourceId);
  return source?.type === "geojson" ? source : undefined;
}
