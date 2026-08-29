"use client";

import { ETIQUETA_SUMINISTRO } from "../_lib/constantes";
import { useFuentesCercanas } from "../_lib/useFuentesCercanas";

function telefonoHref(telefono: string): string {
  const digits = telefono.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

interface FuentesCercanasProps {
  lat: number;
  lng: number;
}

export function FuentesCercanas({ lat, lng }: FuentesCercanasProps) {
  const { fuentes, error } = useFuentesCercanas(lat, lng);

  if (fuentes === undefined) {
    return <p className="text-base text-zinc-600 dark:text-zinc-400">Buscando fuentes cercanas…</p>;
  }

  if (fuentes.length === 0) {
    return (
      <p className="text-base text-zinc-700 dark:text-zinc-300">
        No encontramos fuentes de suministro cerca de ese punto todavía.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm text-amber-800 dark:text-amber-300">
          No se pudo consultar el servidor. Mostramos fuentes de referencia.
        </p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {fuentes.map((fuente) => (
          <li
            key={`${fuente.nombreLugar}-${fuente.contactoTelefono}`}
            className="rounded-2xl border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-zinc-950"
          >
            <p className="text-lg font-semibold text-sky-950 dark:text-sky-50">
              {fuente.nombreLugar}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {fuente.tiposSuministro.map((t) => ETIQUETA_SUMINISTRO[t]).join(" · ")}
              {" · "}
              {fuente.tieneTransporte ? "Con transporte" : "Sin transporte"}
              {" · "}
              {fuente.distanciaKm.toFixed(1)} km
            </p>
            <a
              href={telefonoHref(fuente.contactoTelefono)}
              className="mt-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-sky-800 px-4 text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:bg-sky-600"
            >
              Llamar {fuente.contactoTelefono}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
