import type { Impacto, PersonasRango, TipoSuministro } from "./tipos";

export const RANGOS_PERSONAS: { valor: PersonasRango; etiqueta: string }[] = [
  { valor: "1-5", etiqueta: "1 a 5" },
  { valor: "6-20", etiqueta: "6 a 20" },
  { valor: "21-100", etiqueta: "21 a 100" },
  { valor: "101-500", etiqueta: "101 a 500" },
  { valor: "500+", etiqueta: "Más de 500" },
];

export const IMPACTOS: {
  valor: Impacto;
  etiqueta: string;
  ejemplo: string;
}[] = [
  {
    valor: "casa",
    etiqueta: "Casa",
    ejemplo: "Mi vivienda o la de un vecino.",
  },
  {
    valor: "pasaje",
    etiqueta: "Pasaje",
    ejemplo: "Un pasaje, una cuadra o varias casas juntas.",
  },
  {
    valor: "comunidad",
    etiqueta: "Comunidad",
    ejemplo: "Todo el cantón, la colonia o el caserío.",
  },
];

export const ETIQUETA_SUMINISTRO: Record<TipoSuministro, string> = {
  embotellada: "Agua embotellada",
  pozo: "Pozo",
  nacimiento: "Nacimiento",
  tanque: "Tanque",
  donacion: "Donación",
};

export const CLAVE_BORRADOR = "aguasos.borrador-reporte";
export const CLAVE_FUENTES_SESION = "aguasos.fuentes-cercanas";
