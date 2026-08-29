import type { BoundingBox } from "./tipos";

export const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export const MAP_CENTER = { lat: 13.7942, lng: -88.8965 } as const;
export const MAP_BOUNDS: BoundingBox = {
  west: -90.2,
  south: 12.8,
  east: -87.6,
  north: 14.6,
};
export const MAP_INITIAL_ZOOM = 8;
export const MAP_MIN_ZOOM = 7;
export const MAP_MAX_ZOOM = 18;

// La configuración pública de cache vive en /maplibre/cache-config.js (ver
// spec/via-2-cartografia.md §Cache cartográfico): el origin y los prefijos de
// tiles se duplican ahí porque un service worker estático no puede importar
// TypeScript del cliente; generador común es el upgrade path documentado.
