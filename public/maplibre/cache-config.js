// Configuración pública de cache cartográfico — Vía 2.
// Captura (dueña del service worker) la carga desde /maplibre/cache-config.js
// y aplica cache-on-fetch a estos orígenes y patrones. Ver spec/via-2-cartografia.md §Cache cartográfico.
// Duplicación intencional mínima con src/components/mapa/tiles.ts (el service
// worker estático no puede importar TypeScript del cliente); upgrade path:
// generar ambas salidas desde una configuración común cuando exista un pipeline.
self.MAP_CACHE_CONFIG = {
  styleUrl: "https://tiles.openfreemap.org/styles/liberty",
  origin: "https://tiles.openfreemap.org",
  prefixes: ["/styles/", "/tiles/", "/fonts/", "/sprites/"],
};