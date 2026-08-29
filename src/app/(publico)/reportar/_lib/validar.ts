import { ymdAEpochMsLocal } from "./fechas";
import { puntoListo, type Afectacion } from "./tipos";
import type { Borrador } from "./borrador";

export type CampoError = "punto" | "personas" | "menores" | "impacto" | "escasezDesde";

export type ErroresFormulario = Partial<Record<CampoError, string>>;

export const ENLACES_ERROR: Record<CampoError, { href: string; texto: string }> = {
  punto: {
    href: "#ubicacion",
    texto: "Marcá el punto: usá tu ubicación o el mapa.",
  },
  personas: {
    href: "#personas",
    texto: "Elegí cuántas personas están sin agua.",
  },
  menores: {
    href: "#menores",
    texto: "El número de menores no puede ser negativo.",
  },
  impacto: {
    href: "#impacto",
    texto: "Elegí si afecta a una casa, un pasaje o la comunidad.",
  },
  escasezDesde: {
    href: "#escasezDesde",
    texto: "Indicá desde cuándo hay escasez.",
  },
};

export const ORDEN_ERRORES: CampoError[] = [
  "punto",
  "personas",
  "menores",
  "impacto",
  "escasezDesde",
];

export function parsearMenores(crudo: string): number | null {
  const valor = Number(crudo);
  if (!Number.isFinite(valor) || valor < 0) return null;
  return valor;
}

export function validarBorrador(borrador: Borrador): ErroresFormulario {
  const errores: ErroresFormulario = {};

  if (!puntoListo(borrador.punto)) {
    errores.punto = ENLACES_ERROR.punto.texto;
  }
  if (!borrador.personasRango) {
    errores.personas = ENLACES_ERROR.personas.texto;
  }
  if (parsearMenores(borrador.menores) === null) {
    errores.menores = ENLACES_ERROR.menores.texto;
  }
  if (!borrador.impacto) {
    errores.impacto = ENLACES_ERROR.impacto.texto;
  }
  if (!borrador.escasezDesde) {
    errores.escasezDesde = ENLACES_ERROR.escasezDesde.texto;
  } else {
    try {
      ymdAEpochMsLocal(borrador.escasezDesde);
    } catch {
      errores.escasezDesde = "Indicá una fecha válida.";
    }
  }

  return errores;
}

export function mapearAfectacion(texto: string): Afectacion[] {
  const descripcion = texto.trim();
  if (!descripcion) return [];
  return [{ tipo: "otra", descripcion }];
}
