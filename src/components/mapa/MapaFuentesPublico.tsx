"use client";

import { useState } from "react";
import { ETIQUETA_SUMINISTRO } from "./colores";
import { normalizePhone } from "./CapaFuentes";
import { useCartographyData } from "./datos";
import { MAP_BOUNDS, MAP_CENTER } from "./tiles";
import { MapaBase } from "./MapaBase";
import { CapaFuentes } from "./CapaFuentes";
import { OverlayDatos } from "./OverlayDatos";
import type { GeoJsonFeature, SourceProperties } from "./tipos";

export function MapaFuentesPublico() {
  const [bbox, setBbox] = useState(MAP_BOUNDS);
  const state = useCartographyData({ bbox });

  return (
    <MapaBase
      ariaLabel="Mapa público de fuentes de suministro"
      center={MAP_CENTER}
      initialZoom={8}
      onViewportChange={setBbox}
    >
      <CapaFuentes data={state.collections.sources} />
      <div className="pointer-events-none absolute left-3 top-3 max-w-xs rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm">
        <OverlayDatos state={state} />
      </div>
      <ListaFuentes fuentes={state.collections.sources.features} />
    </MapaBase>
  );
}

function ListaFuentes({ fuentes }: { fuentes: GeoJsonFeature<SourceProperties>[] }) {
  if (fuentes.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 right-3 max-h-56 overflow-y-auto rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-md sm:right-auto sm:max-w-sm">
      <h2 className="text-sm font-semibold text-sky-950">Fuentes disponibles</h2>
      <ul className="mt-2 flex flex-col divide-y divide-sky-100">
        {fuentes.map((source) => {
          const phone = normalizePhone(source.properties.phone);
          return (
            <li key={source.id ?? source.properties.sourceId} className="flex flex-col gap-1 py-2">
              <p className="text-sm font-semibold text-sky-950">{source.properties.placeName}</p>
              <p className="text-xs text-slate-600">
                {source.properties.supplyTypes.map((type) => ETIQUETA_SUMINISTRO[type]).join(" · ")}
                {" · "}
                {source.properties.hasTransport ? "Con transporte" : "Sin transporte"}
              </p>
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex min-h-11 min-w-11 items-center rounded-lg bg-sky-800 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-900"
                >
                  Llamar {source.properties.phone}
                </a>
              ) : (
                <p className="text-xs text-slate-600">Teléfono: {source.properties.phone}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}