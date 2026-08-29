import type {
  AfectacionEconomica,
  ImpactoEspacial,
  NivelRiesgo,
} from "../lib/literals";

export const VIDA_MEDIA_DIAS = 14;
export const UMBRAL_ACTIVO = 0.5;

const PESO_IMPACTO = { casa: 1, pasaje: 3, comunidad: 9 } as const;

/** Se calcula una vez, en la mutation, y se congela en la fila. */
export function severidadBase(r: {
  impacto: ImpactoEspacial;
  personasEst: number;
  menores: number;
  afectacionEconomica: AfectacionEconomica[];
}): number {
  const personas = Math.max(r.personasEst, 1);
  const factorPersonas = 1 + Math.log10(1 + personas);
  const factorMenores = 1 + 0.5 * Math.min(r.menores / personas, 1);
  const economico = Math.min(
    10,
    r.afectacionEconomica.reduce(
      (acc, a) =>
        acc +
        (a.tipo === "siembra"
          ? (a.hectareas * a.porcentajePerdida) / 100
          : 1),
      0,
    ),
  );

  return PESO_IMPACTO[r.impacto] * factorPersonas * factorMenores + economico;
}

/** Decaimiento exponencial por antigüedad. No se persiste. */
export function peso(
  severidad: number,
  creadoEn: number,
  ahora: number,
): number {
  const dias = (ahora - creadoEn) / 86_400_000;
  return severidad * Math.pow(0.5, dias / VIDA_MEDIA_DIAS);
}

export const estaActivo = (p: number) => p >= UMBRAL_ACTIVO;

export const riesgoZona = (pesos: number[]) => pesos.reduce((a, b) => a + b, 0);

export function nivel(riesgo: number, poblacion = 0): NivelRiesgo {
  const umbral = Math.max(30, poblacion * 0.002);
  if (riesgo >= umbral) return "emergencia";
  if (riesgo >= umbral * 0.5) return "vigilancia";
  return "normal";
}
