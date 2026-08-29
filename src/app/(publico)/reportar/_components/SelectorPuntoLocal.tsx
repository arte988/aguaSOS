"use client";

import { useState } from "react";
import type { PuntoElegido } from "../_lib/tipos";
import { Boton, Campo } from "./campos";

interface SelectorPuntoLocalProps {
  valor: PuntoElegido | null;
  onChange: (p: PuntoElegido) => void;
}

export function SelectorPuntoLocal({ valor, onChange }: SelectorPuntoLocalProps) {
  const [errorGps, setErrorGps] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  function aplicarManual(campo: "lat" | "lng", crudo: string) {
    const numero = Number(crudo);
    if (crudo.trim() === "" || !Number.isFinite(numero)) {
      onChange({
        lat: campo === "lat" ? Number.NaN : (valor?.lat ?? Number.NaN),
        lng: campo === "lng" ? Number.NaN : (valor?.lng ?? Number.NaN),
      });
      return;
    }
    onChange({
      lat: campo === "lat" ? numero : (valor?.lat ?? Number.NaN),
      lng: campo === "lng" ? numero : (valor?.lng ?? Number.NaN),
    });
  }

  function usarUbicacion() {
    if (!navigator.geolocation) {
      setErrorGps("Este teléfono no permite leer la ubicación. Escribí latitud y longitud.");
      return;
    }

    setBuscando(true);
    setErrorGps(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscando(false);
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisionM: pos.coords.accuracy,
        });
      },
      (err) => {
        setBuscando(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorGps(
            "No se dio permiso de ubicación. Marcá el punto a mano con latitud y longitud.",
          );
          return;
        }
        setErrorGps("No se pudo leer el GPS. Probá de nuevo o escribí el punto a mano.");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    );
  }

  return (
    <fieldset className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-white/70 p-4 dark:border-sky-900 dark:bg-zinc-950/40">
      <legend className="px-1 text-base font-medium text-sky-950 dark:text-sky-100">
        Ubicación
      </legend>

      <Boton
        variante="secundario"
        onClick={usarUbicacion}
        disabled={buscando}
        aria-describedby={errorGps ? "error-gps" : undefined}
      >
        {buscando ? "Buscando ubicación…" : "Usar mi ubicación"}
      </Boton>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo id="lat" label="Latitud">
          <input
            id="lat"
            name="lat"
            type="number"
            inputMode="decimal"
            step="0.0001"
            required
            value={valor && Number.isFinite(valor.lat) ? valor.lat : ""}
            onChange={(e) => aplicarManual("lat", e.target.value)}
            className="min-h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-base text-sky-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:border-sky-800 dark:bg-zinc-900 dark:text-sky-50"
          />
        </Campo>
        <Campo id="lng" label="Longitud">
          <input
            id="lng"
            name="lng"
            type="number"
            inputMode="decimal"
            step="0.0001"
            required
            value={valor && Number.isFinite(valor.lng) ? valor.lng : ""}
            onChange={(e) => aplicarManual("lng", e.target.value)}
            className="min-h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-base text-sky-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:border-sky-800 dark:bg-zinc-900 dark:text-sky-50"
          />
        </Campo>
      </div>

      {valor && valor.precisionM !== undefined ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Precisión del GPS: {Math.round(valor.precisionM)} m
        </p>
      ) : null}

      {errorGps ? (
        <p id="error-gps" className="text-sm text-red-700 dark:text-red-400">
          {errorGps}
        </p>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Si el permiso se deniega, escribí las coordenadas a mano.
        </p>
      )}
    </fieldset>
  );
}
