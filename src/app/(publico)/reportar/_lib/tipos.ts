import type { Punto } from "@/components/mapa/tipos";

export type { Punto } from "@/components/mapa/tipos";

export type PersonasRango = "1-5" | "6-20" | "21-100" | "101-500" | "500+";

export type Impacto = "casa" | "pasaje" | "comunidad";

export type TipoSuministro =
  | "embotellada"
  | "pozo"
  | "nacimiento"
  | "tanque"
  | "donacion";

export type Afectacion =
  | {
      tipo: "siembra";
      cultivo: string;
      hectareas: number;
      porcentajePerdida: number;
    }
  | { tipo: "otra"; descripcion: string };

export function puntoListo(punto: Punto | null | undefined): punto is Punto {
  return Boolean(punto && Number.isFinite(punto.lat) && Number.isFinite(punto.lng));
}

export interface DatosReporte {
  claveIdempotencia: string;
  lat: number;
  lng: number;
  precisionM?: number;
  canton?: string;
  escasezDesde: number;
  personasRango: PersonasRango;
  menores: number;
  impacto: Impacto;
  afectacionEconomica: Afectacion[];
}

export interface ResultadoCrear {
  reporteId: string;
  distrito?: { nombre: string };
  fuentesCercanas?: FuenteCercana[];
}

export interface FuenteCercana {
  nombreLugar: string;
  tiposSuministro: TipoSuministro[];
  tieneTransporte: boolean;
  contactoTelefono: string;
  distanciaKm: number;
  disponible?: boolean;
}
