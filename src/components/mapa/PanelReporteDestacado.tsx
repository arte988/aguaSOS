"use client";

import Link from "next/link";
import { IMPACTOS, RANGOS_PERSONAS } from "@/app/(publico)/reportar/_lib/constantes";
import { FuentesCercanas } from "@/app/(publico)/reportar/_components/FuentesCercanas";
import { formatearFechaCorta } from "@/lib/formato";
import type { ReporteDestacado } from "@/lib/reporteDestacado";

function etiquetaImpacto(valor: ReporteDestacado["impacto"]) {
  return IMPACTOS.find((item) => item.valor === valor)?.etiqueta ?? valor;
}

function etiquetaPersonas(valor: ReporteDestacado["personasRango"]) {
  return RANGOS_PERSONAS.find((item) => item.valor === valor)?.etiqueta ?? valor;
}

export function PanelReporteDestacado({
  reporte,
  onCerrar,
}: {
  reporte: ReporteDestacado;
  onCerrar?: () => void;
}) {
  return (
    <aside
      className="pointer-events-auto absolute bottom-3 left-3 right-3 max-h-[min(70dvh,32rem)] overflow-y-auto rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-lg sm:left-auto sm:max-w-md"
      aria-labelledby="reporte-destacado-titulo"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Reporte recién enviado</p>
          <h2 id="reporte-destacado-titulo" className="mt-1 text-lg font-semibold text-sky-950">
            Tu reporte quedó en el mapa
          </h2>
        </div>
        {onCerrar ? (
          <button
            type="button"
            onClick={onCerrar}
            className="min-h-11 min-w-11 rounded-lg px-2 text-sm font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            aria-label="Cerrar detalle del reporte"
          >
            ✕
          </button>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-700">
        <div>
          <dt className="font-medium text-sky-950">Alcance</dt>
          <dd>{etiquetaImpacto(reporte.impacto)}</dd>
        </div>
        <div>
          <dt className="font-medium text-sky-950">Personas sin agua</dt>
          <dd>{etiquetaPersonas(reporte.personasRango)}</dd>
        </div>
        <div>
          <dt className="font-medium text-sky-950">Escasez desde</dt>
          <dd>{formatearFechaCorta(reporte.escasezDesde)}</dd>
        </div>
        {reporte.menores > 0 ? (
          <div>
            <dt className="font-medium text-sky-950">Menores afectados</dt>
            <dd>{reporte.menores}</dd>
          </div>
        ) : null}
        {reporte.canton ? (
          <div>
            <dt className="font-medium text-sky-950">Cantón o referencia</dt>
            <dd>{reporte.canton}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium text-sky-950">Registrado</dt>
          <dd>{formatearFechaCorta(reporte.creadoEn)}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-sky-100 pt-4">
        <h3 className="text-sm font-semibold text-sky-950">Fuentes cercanas</h3>
        <div className="mt-2">
          <FuentesCercanas lat={reporte.lat} lng={reporte.lng} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/reportar"
          className="inline-flex min-h-11 items-center rounded-xl bg-sky-800 px-4 text-sm font-semibold text-white hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
          Enviar otro reporte
        </Link>
        <Link
          href="/mapa"
          className="inline-flex min-h-11 items-center rounded-xl border border-sky-200 px-4 text-sm font-semibold text-sky-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
          Ver mapa completo
        </Link>
      </div>
    </aside>
  );
}
