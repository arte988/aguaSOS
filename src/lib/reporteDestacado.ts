import type { Impacto, PersonasRango } from "@/app/(publico)/reportar/_lib/tipos";

export const CLAVE_REPORTE_DESTACADO = "aguasos.reporte-destacado";

export type ReporteDestacado = {
  reporteId: string;
  lat: number;
  lng: number;
  personasRango: PersonasRango;
  impacto: Impacto;
  escasezDesde: number;
  menores: number;
  canton?: string;
  creadoEn: number;
};

export function guardarReporteDestacado(reporte: ReporteDestacado) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CLAVE_REPORTE_DESTACADO, JSON.stringify(reporte));
}

export function leerReporteDestacado(): ReporteDestacado | null {
  if (typeof window === "undefined") return null;
  const crudo = sessionStorage.getItem(CLAVE_REPORTE_DESTACADO);
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as ReporteDestacado;
  } catch {
    return null;
  }
}

export function limpiarReporteDestacado() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CLAVE_REPORTE_DESTACADO);
}
