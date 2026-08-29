"use client";

import type { CartographyDataState } from "./tipos";

export function OverlayDatos({ state }: { state: CartographyDataState }) {
  return (
    <div className="flex flex-col gap-2">
      {state.origin === "fixture" ? (
        <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
          Datos de demostración
        </p>
      ) : null}
      <p className="text-sm text-slate-600" role="status" aria-live="polite">
        {state.status === "loading"
          ? "Cargando datos del mapa…"
          : state.status === "error"
            ? `No se pudieron cargar los datos: ${state.error ?? "error desconocido"}`
            : isEmpty(state.collections)
              ? "No hay datos para este rango y esta vista."
              : null}
      </p>
    </div>
  );
}

function isEmpty(collections: CartographyDataState["collections"]) {
  return (
    collections.risk.features.length === 0 &&
    collections.emergencies.features.length === 0 &&
    collections.sources.features.length === 0
  );
}