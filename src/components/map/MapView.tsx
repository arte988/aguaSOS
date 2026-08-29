"use client";

import { useEffect, useRef } from "react";
import { Map, NavigationControl, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

if (typeof window !== "undefined") {
  setWorkerUrl(`${window.location.origin}/maplibre/maplibre-gl-worker.mjs`);
}

const EL_SALVADOR_CENTER: [number, number] = [-88.8965, 13.7942];
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

function hasRealSize(element: HTMLElement): boolean {
  return element.clientWidth > 8 && element.clientHeight > 8;
}

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let map: Map | null = null;
    let observer: ResizeObserver | null = null;

    const startMap = () => {
      if (cancelled || mapRef.current || !hasRealSize(container)) {
        return;
      }

      map = new Map({
        container,
        style: OPENFREEMAP_STYLE,
        center: EL_SALVADOR_CENTER,
        zoom: 8,
      });

      map.addControl(new NavigationControl(), "top-right");
      map.on("error", (event) => {
        console.error("MapLibre error:", event.error);
      });
      map.once("load", () => {
        map?.resize();
      });
      mapRef.current = map;
    };

    observer = new ResizeObserver(() => {
      if (!mapRef.current) {
        startMap();
        return;
      }
      mapRef.current.resize();
    });
    observer.observe(container);
    startMap();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full min-h-0 w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        style={{ minHeight: "240px" }}
      />
    </div>
  );
}
