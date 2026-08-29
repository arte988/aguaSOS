"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map,
  Marker,
  type MapMouseEvent,
  type Map as MapLibreMap,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_BOUNDS, MAP_CENTER, MAP_INITIAL_ZOOM, MAP_MAX_ZOOM, MAP_MIN_ZOOM, OPENFREEMAP_STYLE_URL } from "./tiles";
import type { MapaBaseProps } from "./mapa-contrato";
import { MapRuntimeProvider, getGeoJsonSource, useMapRuntime, type MapRuntime, type MapStatus } from "./mapa-contexto";
import type { BoundingBox, Punto } from "./tipos";

export function MapCanvas(props: MapaBaseProps) {
  const [attempt, setAttempt] = useState(0);

  return (
    <MapInstance
      key={attempt}
      {...props}
      onRetry={() => setAttempt((current) => current + 1)}
    />
  );
}

function MapInstance({
  children,
  ariaLabel = "Mapa de El Salvador",
  center = MAP_CENTER,
  initialZoom = MAP_INITIAL_ZOOM,
  onViewportChange,
  onMapClick,
  selectedPoint,
  onMarkerDragEnd,
  showMarker = false,
  onRetry,
}: MapaBaseProps & { onRetry: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<Marker | null>(null);
  const callbacksRef = useRef({ onViewportChange, onMapClick, onMarkerDragEnd });
  // El centro es solo el punto inicial de montaje: un cambio posterior del valor
  // controlado mueve el marcador, no recrea la instancia de MapLibre.
  const [initialCenter] = useState(() => center);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [tileError, setTileError] = useState<string | null>(null);

  // Keep map event handlers reading fresh callbacks without re-registering them
  // on every parent render.
  useEffect(() => {
    callbacksRef.current = { onViewportChange, onMapClick, onMarkerDragEnd };
  }, [onMapClick, onMarkerDragEnd, onViewportChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let styleReady = false;
    const instance = new Map({
      container,
      style: OPENFREEMAP_STYLE_URL,
      center: [initialCenter.lng, initialCenter.lat],
      zoom: initialZoom,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      maxBounds: [
        [MAP_BOUNDS.west, MAP_BOUNDS.south],
        [MAP_BOUNDS.east, MAP_BOUNDS.north],
      ],
    });

    const handleLoad = () => {
      styleReady = true;
      setFatalError(null);
      setStatus("ready");
      callbacksRef.current.onViewportChange?.(getBoundingBox(instance));
    };
    const handleMoveEnd = () => {
      callbacksRef.current.onViewportChange?.(getBoundingBox(instance));
    };
    const handleMapClick = (event: MapMouseEvent) => {
      callbacksRef.current.onMapClick?.({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    };
    const handleError = (event: { error?: { message?: string } }) => {
      const message = event.error?.message ?? "No se pudo cargar un recurso cartográfico.";
      if (styleReady || instance.isStyleLoaded()) {
        setTileError(message);
        return;
      }
      setFatalError(message);
      setStatus("error");
    };

    instance.on("load", handleLoad);
    instance.on("moveend", handleMoveEnd);
    instance.on("click", handleMapClick);
    instance.on("error", handleError);
    setMap(instance);

    return () => {
      instance.off("load", handleLoad);
      instance.off("moveend", handleMoveEnd);
      instance.off("click", handleMapClick);
      instance.off("error", handleError);
      instance.remove();
      setMap(null);
    };
  }, [initialCenter.lat, initialCenter.lng, initialZoom]);

  useEffect(() => {
    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const point = selectedPoint;
    if (!map || status !== "ready" || !showMarker || !point || !isValidPoint(point)) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const position: [number, number] = [point.lng, point.lat];
    if (!markerRef.current) {
      const marker = new Marker({ color: "#b91c1c", draggable: true })
        .setLngLat(position)
        .addTo(map);
      marker.on("dragend", () => {
        const dragged = marker.getLngLat();
        callbacksRef.current.onMarkerDragEnd?.({ lat: dragged.lat, lng: dragged.lng });
      });
      markerRef.current = marker;
      return;
    }

    markerRef.current.setLngLat(position);
  }, [map, selectedPoint, showMarker, status]);

  const runtime: MapRuntime = {
    map,
    status,
    tileError,
    getGeoJsonSource: (sourceId) => getGeoJsonSource(map, sourceId),
  };

  return (
    <MapRuntimeProvider value={runtime}>
      <div className="relative h-full min-h-80 w-full overflow-hidden rounded-2xl bg-sky-100">
        <div
          ref={containerRef}
          className="absolute inset-0 h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-inset"
          role="application"
          aria-label={ariaLabel}
          tabIndex={0}
        />
        {children}
        <MapControls center={initialCenter} initialZoom={initialZoom} />
        {status === "loading" ? (
          <div
            className="pointer-events-none absolute inset-0 grid place-items-center bg-white/70 text-sm font-medium text-sky-950"
            role="status"
            aria-live="polite"
          >
            Cargando mapa…
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-white/95 p-6 text-center">
            <div role="alert" className="max-w-sm">
              <p className="font-semibold text-rose-900">No se pudo cargar el mapa.</p>
              <p className="mt-2 text-sm text-slate-600">{fatalError}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 min-h-11 rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : null}
        {status === "ready" && tileError ? (
          <p
            className="absolute bottom-3 left-3 max-w-xs rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm"
            role="status"
            aria-live="polite"
          >
            Algunos recursos del mapa no cargaron; podés seguir consultando los datos visibles.
          </p>
        ) : null}
      </div>
    </MapRuntimeProvider>
  );
}

function MapControls({ center, initialZoom }: { center: Punto; initialZoom: number }) {
  const runtime = useMapRuntime();
  if (!runtime.map || runtime.status !== "ready") return null;

  return (
    <div
      className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md"
      aria-label="Controles del mapa"
    >
      <button
        type="button"
        aria-label="Acercar mapa"
        title="Acercar"
        onClick={() => runtime.map?.zoomIn()}
        className="min-h-11 min-w-11 border-b border-slate-200 text-xl font-semibold text-sky-950 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-700"
      >
        +
      </button>
      <button
        type="button"
        aria-label="Alejar mapa"
        title="Alejar"
        onClick={() => runtime.map?.zoomOut()}
        className="min-h-11 min-w-11 border-b border-slate-200 text-xl font-semibold text-sky-950 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-700"
      >
        −
      </button>
      <button
        type="button"
        aria-label="Volver al centro de El Salvador"
        title="Centrar mapa"
        onClick={() => runtime.map?.easeTo({ center: [center.lng, center.lat], zoom: initialZoom })}
        className="min-h-11 min-w-11 px-2 text-xs font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-700"
      >
        SV
      </button>
    </div>
  );
}

function getBoundingBox(map: MapLibreMap): BoundingBox {
  const bounds = map.getBounds();
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };
}

function isValidPoint(point: Punto) {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}
