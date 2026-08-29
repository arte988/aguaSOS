"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COLORES_RIESGO, ETIQUETA_NIVEL } from "./colores";
import { CapaEmergencia } from "./CapaEmergencia";
import { CapaFuentes } from "./CapaFuentes";
import { CapaRiesgo } from "./CapaRiesgo";
import { useCartographyData } from "./datos";
import {
  defaultDateRange,
  normalizeDateRange,
  parseCapasUrl,
  parseRangoUrl,
  type CapasUrl,
} from "./logica";
import { MAP_BOUNDS, MAP_CENTER } from "./tiles";
import { MapaBase } from "./MapaBase";
import { OverlayDatos } from "./OverlayDatos";

const DEFAULT_RANGE = defaultDateRange();

export function TableroCartografico() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [bbox, setBbox] = useState(MAP_BOUNDS);

  const rangoEntrante = parseRangoUrl(searchParams, DEFAULT_RANGE);
  const normalizado = normalizeDateRange(rangoEntrante);
  const rango = normalizado.range;
  const rangoInvertido = normalizado.inverted;
  // Estado único en la URL: los toggles derivan de los parámetros y vuelven a
  // sincronizarse en navegación atrás/adelante sin estado local adicional.
  const capas: CapasUrl = parseCapasUrl(searchParams);

  const actualizarUrl = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  function alternarCapa(capa: keyof CapasUrl) {
    actualizarUrl({ [capa]: capas[capa] ? "0" : "1" });
  }

  const state = useCartographyData({ bbox, dateRange: rango });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-sky-950">Tablero analítico</h1>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-sky-950">Desde</span>
              <input
                type="date"
                value={rangoEntrante.from}
                max={rangoEntrante.to}
                onChange={(event) => actualizarUrl({ desde: event.target.value })}
                className="input max-w-44"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-sky-950">Hasta</span>
              <input
                type="date"
                value={rangoEntrante.to}
                min={rangoEntrante.from}
                onChange={(event) => actualizarUrl({ hasta: event.target.value })}
                className="input max-w-44"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Capas visibles">
            {(
              [
                ["riesgo", "Riesgo"],
                ["emergencia", "Emergencias"],
                ["fuentes", "Fuentes"],
              ] as const
            ).map(([capa, label]) => (
              <button
                key={capa}
                type="button"
                aria-pressed={capas[capa]}
                onClick={() => alternarCapa(capa)}
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                  capas[capa]
                    ? "border-sky-700 bg-sky-800 text-white"
                    : "border-sky-200 bg-white text-sky-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <Leyenda />
        {rangoInvertido ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
            El rango estaba invertido; se corrigió a {rango.from} – {rango.to}.
          </p>
        ) : null}
      </header>

      <div className="h-[calc(100dvh-20rem)] min-h-112 w-full">
        <MapaBase ariaLabel="Tablero analítico de aguaSOS" center={MAP_CENTER} initialZoom={8} onViewportChange={setBbox}>
          {capas.riesgo ? <CapaRiesgo data={state.collections.risk} /> : null}
          {capas.emergencia ? <CapaEmergencia data={state.collections.emergencies} /> : null}
          {capas.fuentes ? <CapaFuentes data={state.collections.sources} /> : null}
          <div className="pointer-events-none absolute left-3 top-3 max-w-xs rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm">
            <OverlayDatos state={state} />
          </div>
        </MapaBase>
      </div>
    </div>
  );
}

const ANCLAJES = [
  { weight: 0, intensity: 0 },
  { weight: 5, intensity: 0.25 },
  { weight: 20, intensity: 0.65 },
  { weight: 60, intensity: 1 },
];

export function Leyenda() {
  return (
    <div className="rounded-2xl border border-sky-200 bg-white p-3 text-sm text-slate-700">
      <p className="font-semibold text-sky-950">Leyenda</p>
      <dl className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: COLORES_RIESGO.normal }} />
          <dt className="sr-only">Normal</dt>
          <dd>Normal</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: COLORES_RIESGO.vigilancia }} />
          <dt className="sr-only">Vigilancia</dt>
          <dd>{ETIQUETA_NIVEL.vigilancia}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: COLORES_RIESGO.emergencia }} />
          <dt className="sr-only">Emergencia</dt>
          <dd>{ETIQUETA_NIVEL.emergencia}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-slate-600">
        El calor del mapa va de{" "}
        {ANCLAJES.map((a) => `peso ${a.weight} → ${Math.round(a.intensity * 100)}%`).join(" · ")}.
        La intensidad no cambia con los filtros ni el zoom.
      </p>
    </div>
  );
}