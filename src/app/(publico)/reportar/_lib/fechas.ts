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
  const partes = ymd.split("-").map(Number);
  const y = partes[0];
  const m = partes[1];
  const d = partes[2];
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error("Fecha inválida");
  }
  return new Date(y, m - 1, d).getTime();
}
