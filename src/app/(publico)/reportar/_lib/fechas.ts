/** Fecha local YYYY-MM-DD. No usar `new Date("YYYY-MM-DD")`: eso es medianoche UTC. */
export function hoyLocalYmd(): string {
  return epochMsAYmd(Date.now());
}

export function epochMsAYmd(ms: number): string {
  const fecha = new Date(ms);
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ymdAEpochMsLocal(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error("Fecha inválida");
  }
  const fecha = new Date(y, m - 1, d);
  if (fecha.getFullYear() !== y || fecha.getMonth() !== m - 1 || fecha.getDate() !== d) {
    throw new Error("Fecha inválida");
  }
  return fecha.getTime();
}
