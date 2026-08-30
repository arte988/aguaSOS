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

export function useEnviarReporte() {
  return async function enviar(datos: DatosReporte): Promise<ResultadoCrear> {
    const viaConvex = await crearReporteEnConvex(datos);
    guardarFuentesDeSesion(viaConvex.fuentesCercanas);
    return viaConvex;
  };
}
