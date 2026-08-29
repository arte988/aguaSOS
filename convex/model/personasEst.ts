import type { PersonasRango } from "../lib/literals";

/**
 * Punto medio del rango documentado.
 * `500+` no tiene techo: se usa el único extremo del literal (500).
 */
export function personasEstDesdeRango(rango: PersonasRango): number {
  if (rango === "500+") {
    return 500;
  }
  const partes = rango.split("-");
  const inicio = Number(partes[0]);
  const fin = Number(partes[1]);
  return (inicio + fin) / 2;
}
