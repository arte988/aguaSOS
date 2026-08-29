import { OPENFREEMAP_STYLE_URL } from "./tiles";

let iniciado = false;

function enNavegador() {
  return typeof window !== "undefined";
}

/** Conexión temprana al CDN de tiles (idempotente). */
export function asegurarPreconexionTiles() {
  if (!enNavegador()) return;

  for (const rel of ["preconnect", "dns-prefetch"] as const) {
    const selector = `link[rel="${rel}"][href="https://tiles.openfreemap.org"]`;
    if (document.head.querySelector(selector)) continue;
    const link = document.createElement("link");
    link.rel = rel;
    link.href = "https://tiles.openfreemap.org";
    if (rel === "preconnect") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}

/** Calienta la caché HTTP del JSON de estilo antes de que MapLibre lo pida. */
export function precargarEstiloMapa() {
  if (!enNavegador()) return;
  void fetch(OPENFREEMAP_STYLE_URL, {
    mode: "cors",
    credentials: "omit",
    cache: "force-cache",
  }).catch(() => {
    /* El mapa reintenta al montar; esto solo adelanta la descarga. */
  });
}

/** Descarga el chunk de MapCanvas + maplibre-gl (~1 MB) antes de abrir /mapa. */
export function precargarChunkMapa() {
  if (!enNavegador()) return;
  void import("./MapaCanvas");
}

/** Precarga completa; segura de llamar varias veces. */
export function precargarCartografia() {
  if (!enNavegador() || iniciado) return;
  iniciado = true;
  asegurarPreconexionTiles();
  precargarEstiloMapa();
  precargarChunkMapa();
}

export function precargarCartografiaEnIdle() {
  if (!enNavegador()) return;
  const ejecutar = () => precargarCartografia();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(ejecutar, { timeout: 2500 });
  } else {
    globalThis.setTimeout(ejecutar, 800);
  }
}
