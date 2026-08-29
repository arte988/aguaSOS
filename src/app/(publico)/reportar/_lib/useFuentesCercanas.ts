"use client";

import { useEffect, useState } from "react";
import { fuentesCercanasEnConvex } from "./clienteConvex";
import { CLAVE_FUENTES_SESION } from "./constantes";
import type { FuenteCercana } from "./tipos";

const MOCK_FUENTES: FuenteCercana[] = [
  {
    nombreLugar: "Pozo comunitario El Carmen",
    tiposSuministro: ["pozo"],
    tieneTransporte: false,
    contactoTelefono: "2234-1188",
    distanciaKm: 1.2,
    disponible: true,
  },
  {
    nombreLugar: "Tanque Soyapango Centro",
    tiposSuministro: ["tanque", "embotellada"],
    tieneTransporte: true,
    contactoTelefono: "2277-4501",
    distanciaKm: 3.4,
    disponible: true,
  },
  {
    nombreLugar: "Donación Agua Viva",
    tiposSuministro: ["donacion"],
    tieneTransporte: true,
    contactoTelefono: "7940-2210",
    distanciaKm: 5.1,
    disponible: true,
  },
];

function leerFuentesDeSesion(): FuenteCercana[] | null {
  if (typeof window === "undefined") return null;
  const crudo = sessionStorage.getItem(CLAVE_FUENTES_SESION);
  if (!crudo) return null;
  try {
    const parsed: unknown = JSON.parse(crudo);
    return Array.isArray(parsed) ? (parsed as FuenteCercana[]) : null;
  } catch {
    return null;
  }
}

function filtrarDisponibles(fuentes: FuenteCercana[]): FuenteCercana[] {
  return fuentes.filter((fuente) => fuente.disponible !== false).slice(0, 3);
}

export function useFuentesCercanas(lat: number, lng: number) {
  const puntoValido = Number.isFinite(lat) && Number.isFinite(lng);
  const [fuentes, setFuentes] = useState<FuenteCercana[] | undefined>(
    puntoValido ? undefined : [],
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!puntoValido) return;

    let cancelado = false;

    async function cargar() {
      const deSesion = leerFuentesDeSesion();
      if (deSesion) {
        if (!cancelado) setFuentes(filtrarDisponibles(deSesion));
        return;
      }

      try {
        const viaConvex = await fuentesCercanasEnConvex({ lat, lng });
        if (cancelado) return;
        if (viaConvex) {
          setFuentes(filtrarDisponibles(viaConvex));
          return;
        }
        setFuentes(filtrarDisponibles(MOCK_FUENTES));
      } catch (err) {
        if (cancelado) return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las fuentes cercanas",
        );
        setFuentes(filtrarDisponibles(MOCK_FUENTES));
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, [lat, lng, puntoValido]);

  return { fuentes: puntoValido ? fuentes : [], error };
}
