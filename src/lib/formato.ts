const LOCALE = "es-SV";

function aFecha(valor: Date | number | string): Date {
  return valor instanceof Date ? valor : new Date(valor);
}

export function formatearFecha(valor: Date | number | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(aFecha(valor));
}

export function formatearFechaCorta(valor: Date | number | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
  }).format(aFecha(valor));
}

export function formatearNumero(
  valor: number,
  opciones?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(LOCALE, opciones).format(valor);
}

/** `0.7` → `"70 %"`. Si el valor es mayor que 1, se trata como porcentaje ya escalado. */
export function formatearPorcentaje(valor: number): string {
  const fraccion = Math.abs(valor) <= 1 ? valor : valor / 100;
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(fraccion);
}
