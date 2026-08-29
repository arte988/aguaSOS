"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ETIQUETA_SUMINISTRO } from "./colores";
import { normalizePhone } from "./CapaFuentes";
import { CapaRiesgo } from "./CapaRiesgo";
import { useCartographyData } from "./datos";
import { LeyendaRiesgoCompacta } from "./LeyendaRiesgoCompacta";
import { mezclarReporteEnRiesgo } from "./logica";
import { MAP_BOUNDS, MAP_CENTER, MAP_INITIAL_ZOOM } from "./tiles";
import { MapCanvas } from "./MapaCanvas";
import { CapaFuentes } from "./CapaFuentes";
import { OverlayDatos } from "./OverlayDatos";
import { PanelReporteDestacado } from "./PanelReporteDestacado";
import type { GeoJsonFeature, Punto, SourceProperties } from "./tipos";
import {
  leerReporteDestacado,
  limpiarReporteDestacado,
  type ReporteDestacado,
} from "@/lib/reporteDestacado";
import { precargarCartografia } from "./precargar";

function parsePunto(searchParams: URLSearchParams): Punto | null {
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function MapaFuentesPublico() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bbox, setBbox] = useState(MAP_BOUNDS);
  const state = useCartographyData({ bbox });

  useEffect(() => {
    precargarCartografia();
  }, []);

  const reporteId = searchParams.get("reporteId");
  const puntoUrl = useMemo(() => parsePunto(searchParams), [searchParams]);
  const [reporteDestacado, setReporteDestacado] = useState<ReporteDestacado | null>(null);
  const [sesionLista, setSesionLista] = useState(false);

  // sessionStorage solo existe en el cliente; leerlo en render rompe la hidratación.
  useEffect(() => {
    if (!reporteId || !puntoUrl) {
      setReporteDestacado(null);
      setSesionLista(true);
      return;
    }
    const guardado = leerReporteDestacado();
    if (guardado?.reporteId === reporteId) {
      setReporteDestacado(guardado);
    } else {
      setReporteDestacado(null);
    }
    setSesionLista(true);
  }, [puntoUrl, reporteId]);

  useEffect(() => {
    if (!sesionLista) return;
    const tieneParams = reporteId || searchParams.has("lat") || searchParams.has("lng");
    if (tieneParams && !reporteDestacado) {
      router.replace("/mapa", { scroll: false });
    }
  }, [reporteDestacado, reporteId, router, searchParams, sesionLista]);

  const puntoReporte = reporteDestacado
    ? { lat: reporteDestacado.lat, lng: reporteDestacado.lng }
    : null;

  const riesgo = useMemo(
    () => mezclarReporteEnRiesgo(state.collections.risk, reporteDestacado),
    [reporteDestacado, state.collections.risk],
  );

  function cerrarDestacado() {
    limpiarReporteDestacado();
    router.replace("/mapa", { scroll: false });
  }

  return (
    <MapCanvas
      key={reporteDestacado?.reporteId ?? "mapa-general"}
      className="absolute inset-0 h-full min-h-0"
      ariaLabel="Mapa público de fuentes de suministro"
      bordeRedondeado={false}
      center={puntoReporte ?? MAP_CENTER}
      initialZoom={puntoReporte ? 14 : MAP_INITIAL_ZOOM}
      focusPoint={puntoReporte}
      focusZoom={14}
      selectedPoint={puntoReporte}
      showMarker={Boolean(puntoReporte)}
      markerDraggable={false}
      onViewportChange={setBbox}
    >
      <CapaRiesgo data={riesgo} />
      <CapaFuentes data={state.collections.sources} />
      <div className="pointer-events-none absolute left-3 top-3 flex max-w-xs flex-col gap-2">
        <OverlayDatos state={state} />
        <LeyendaRiesgoCompacta />
      </div>
      {reporteDestacado ? (
        <PanelReporteDestacado reporte={reporteDestacado} onCerrar={cerrarDestacado} />
      ) : (
        <ListaFuentes fuentes={state.collections.sources.features} />
      )}
    </MapCanvas>
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
