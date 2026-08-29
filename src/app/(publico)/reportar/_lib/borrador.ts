import { CLAVE_BORRADOR } from "./constantes";
import { hoyLocalYmd } from "./fechas";
import type { Impacto, PersonasRango, PuntoElegido } from "./tipos";

export interface Borrador {
  claveIdempotencia: string;
  punto: PuntoElegido | null;
  personasRango: PersonasRango | null;
  menores: string;
  impacto: Impacto | null;
  escasezDesde: string;
  canton: string;
  afectacion: string;
}

const VACIO_SERVIDOR: Borrador = {
  claveIdempotencia: "",
  punto: null,
  personasRango: null,
  menores: "0",
  impacto: null,
  escasezDesde: "",
  canton: "",
  afectacion: "",
};

const listeners = new Set<() => void>();
let cacheCliente: Borrador | null = null;

function emitir() {
  listeners.forEach((listener) => listener());
}

function leerDisco(): Borrador | null {
  try {
    const crudo = localStorage.getItem(CLAVE_BORRADOR);
    if (!crudo) return null;
    return JSON.parse(crudo) as Borrador;
  } catch {
    return null;
  }
}

function puntoValido(punto: PuntoElegido | null): PuntoElegido | null {
  if (!punto) return null;
  if (!Number.isFinite(punto.lat) || !Number.isFinite(punto.lng)) return null;
  return punto;
}

function normalizar(crudo: Borrador): Borrador {
  return {
    ...crudo,
    punto: puntoValido(crudo.punto),
    claveIdempotencia: crudo.claveIdempotencia || crypto.randomUUID(),
    escasezDesde: crudo.escasezDesde || hoyLocalYmd(),
    menores: crudo.menores || "0",
  };
}

export function suscribirBorrador(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function leerBorradorCliente(): Borrador {
  if (cacheCliente) return cacheCliente;
  const disco = leerDisco();
  cacheCliente = disco
    ? normalizar(disco)
    : normalizar({
        ...VACIO_SERVIDOR,
        claveIdempotencia: crypto.randomUUID(),
        escasezDesde: hoyLocalYmd(),
      });
  return cacheCliente;
}

export function leerBorradorServidor(): Borrador {
  return VACIO_SERVIDOR;
}

export function guardarBorrador(siguiente: Borrador) {
  cacheCliente = siguiente;
  localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(siguiente));
  emitir();
}

export function parchearBorrador(parcial: Partial<Borrador>) {
  guardarBorrador({ ...leerBorradorCliente(), ...parcial });
}

export function borrarBorrador() {
  cacheCliente = null;
  localStorage.removeItem(CLAVE_BORRADOR);
  emitir();
}
