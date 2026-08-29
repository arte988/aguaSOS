"use client";

import { crearReporteEnConvex } from "./clienteConvex";
import { CLAVE_FUENTES_SESION } from "./constantes";
import type { DatosReporte, ResultadoCrear } from "./tipos";

function guardarFuentesDeSesion(fuentes: ResultadoCrear["fuentesCercanas"]) {
  if (typeof window === "undefined") return;
  if (!fuentes || fuentes.length === 0) {
    sessionStorage.removeItem(CLAVE_FUENTES_SESION);
    return;
  }
  sessionStorage.setItem(CLAVE_FUENTES_SESION, JSON.stringify(fuentes));
}

function enviarMock(datos: DatosReporte): ResultadoCrear {
  const reporteId = `mock-${datos.claveIdempotencia}`;
  if (process.env.NODE_ENV !== "production") {
    console.info("[aguaSOS] reporte mock (Convex aún no está)", datos);
  }
  return { reporteId };
}

export function useEnviarReporte() {
  return async function enviar(datos: DatosReporte): Promise<ResultadoCrear> {
    const viaConvex = await crearReporteEnConvex(datos);
    if (viaConvex) {
      guardarFuentesDeSesion(viaConvex.fuentesCercanas);
      return viaConvex;
    }

    const mock = enviarMock(datos);
    guardarFuentesDeSesion(undefined);
    return mock;
  };
}
