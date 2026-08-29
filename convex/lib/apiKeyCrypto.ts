const PREFIJO_LARGO = 8;

/** Web Crypto del runtime Convex (no hace falta `"use node"`). */
export async function sha256Hex(valor: string): Promise<string> {
  const datos = new TextEncoder().encode(valor);
  const digest = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export function generarToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const cuerpo = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `ags_${cuerpo}`;
}

export function prefijoDeToken(token: string): string {
  return token.slice(0, PREFIJO_LARGO);
}
