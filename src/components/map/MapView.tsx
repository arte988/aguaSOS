"use client";

import { useEffect, useRef } from "react";
import { Map, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const EL_SALVADOR_CENTER: [number, number] = [-88.8965, 13.7942];
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const map = new Map({
      container,
      style: OPENFREEMAP_STYLE,
      center: EL_SALVADOR_CENTER,
      zoom: 8,
    });

    map.addControl(new NavigationControl(), "top-right");
    mapRef.current = map;
    map.resize();

    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full min-h-0 w-full">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
