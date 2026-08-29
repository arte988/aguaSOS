import type { AfectacionEconomica } from "./literals";

export function validarCoordenadas(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Coordenadas inválidas");
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Coordenadas inválidas");
  }
}

export function validarPrecision(precisionM: number | undefined) {
  if (precisionM === undefined) {
    return;
  }
  if (!Number.isFinite(precisionM) || precisionM < 0) {
    throw new Error("precisionM inválida");
  }
}

export function validarClaveIdempotencia(clave: string) {
  if (clave.trim().length === 0) {
    throw new Error("claveIdempotencia inválida");
  }
}

export function validarEscasezDesde(escasezDesde: number, ahora: number) {
  if (!Number.isFinite(escasezDesde)) {
    throw new Error("escasezDesde inválido");
  }
  if (escasezDesde > ahora + 86_400_000) {
    throw new Error("escasezDesde no puede ser futuro");
  }
}

export function validarMenores(menores: number, personasEst: number) {
  if (!Number.isFinite(menores) || menores < 0) {
    throw new Error("personas inválidas: menores");
  }
  if (!Number.isInteger(menores)) {
    throw new Error("personas inválidas: menores");
  }
  if (menores > Math.max(personasEst, 1) * 10) {
    throw new Error("personas inválidas: menores");
  }
}

export function validarAfectacion(items: AfectacionEconomica[]) {
  for (const item of items) {
    if (item.tipo === "siembra") {
      if (item.cultivo.trim().length === 0) {
        throw new Error("afectacionEconomica inválida: cultivo");
      }
      if (!Number.isFinite(item.hectareas) || item.hectareas < 0) {
        throw new Error("afectacionEconomica inválida: hectareas");
      }
      if (
        !Number.isFinite(item.porcentajePerdida) ||
        item.porcentajePerdida < 0 ||
        item.porcentajePerdida > 100
      ) {
        throw new Error("afectacionEconomica inválida: porcentajePerdida");
      }
    } else if (item.descripcion.trim().length === 0) {
      throw new Error("afectacionEconomica inválida: descripcion");
    }
  }
}

export function validarCanton(canton: string | undefined) {
  if (canton !== undefined && canton.trim().length === 0) {
    throw new Error("canton inválido");
  }
}
