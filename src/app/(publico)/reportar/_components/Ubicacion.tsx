"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { MAP_CENTER } from "@/components/mapa/tiles";
import { formatearNumero } from "@/lib/formato";
import { CLASE_INPUT } from "../_lib/clases";
import { puntoListo, type Punto } from "../_lib/tipos";
import { IconoPin } from "./iconos";

const SelectorPunto = dynamic(
  () => import("@/components/mapa/SelectorPunto").then((modulo) => modulo.SelectorPunto),
  {
    ssr: false,
    loading: () => (
      <div
        className="grid min-h-80 w-full place-items-center rounded-2xl bg-pila text-sm text-pozo"
        role="status"
        aria-live="polite"
      >
        Cargando mapa…
      </div>
    ),
  },
);

interface UbicacionProps {
  valor: Punto | null;
  onChange: (punto: Punto) => void;
  error?: string;
}

export function Ubicacion({ valor, onChange, error }: UbicacionProps) {
  const [errorGps, setErrorGps] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [mapaAbierto, setMapaAbierto] = useState(false);
  const [manualAbierto, setManualAbierto] = useState(false);
  const [latManual, setLatManual] = useState(
    valor && Number.isFinite(valor.lat) ? String(valor.lat) : "",
  );
  const [lngManual, setLngManual] = useState(
    valor && Number.isFinite(valor.lng) ? String(valor.lng) : "",
  );

  const tomada = puntoListo(valor);

  function aplicarManual(campo: "lat" | "lng", crudo: string) {
    const siguienteLat = campo === "lat" ? crudo : latManual;
    const siguienteLng = campo === "lng" ? crudo : lngManual;
    if (campo === "lat") setLatManual(crudo);
    else setLngManual(crudo);

    const lat = Number(siguienteLat);
    const lng = Number(siguienteLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setErrorGps(null);
    onChange({ lat, lng });
  }

  function usarUbicacion() {
    if (!navigator.geolocation) {
      setErrorGps("Este teléfono no lee la ubicación. Abrí el mapa o escribí las coordenadas.");
      setManualAbierto(true);
      return;
    }

    setBuscando(true);
    setErrorGps(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscando(false);
        const punto = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisionM: pos.coords.accuracy,
        };
        setLatManual(String(punto.lat));
        setLngManual(String(punto.lng));
        setErrorGps(null);
        onChange(punto);
      },
      (err) => {
        setBuscando(false);
        setManualAbierto(true);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorGps(
            "No se dio permiso de ubicación. Abrí el mapa o escribí las coordenadas.",
          );
          return;
        }
        setErrorGps("No se pudo leer el GPS. Probá de nuevo, abrí el mapa o escribí el punto.");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    );
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-xl font-semibold text-pozo">Ubicación</legend>

      <Boton
        variante="primario"
        onClick={usarUbicacion}
        disabled={buscando}
        className="w-full motion-reduce:transition-none"
        aria-describedby={errorGps ? "error-gps" : undefined}
      >
        <span className="inline-flex items-center gap-2">
          <IconoPin />
          {buscando ? "Buscando ubicación…" : "Usar mi ubicación"}
        </span>
      </Boton>

      {tomada ? (
        <p className="text-sm text-foreground">
          Ubicación tomada
          <span className="mt-1 block font-mono text-pozo">
            {valor.lat.toFixed(5)}
            {", "}
            {valor.lng.toFixed(5)}
            {valor.precisionM !== undefined
              ? ` · ${formatearNumero(Math.round(valor.precisionM))} m`
              : null}
          </span>
        </p>
      ) : (
        <p className="text-sm text-foreground/70">
          Primero usá tu ubicación. El mapa y las coordenadas son por si el GPS no responde.
        </p>
      )}

      {errorGps && !tomada ? (
        <p id="error-gps" className="text-sm text-sequia" role="alert">
          {errorGps}
        </p>
      ) : null}

      {error ? (
        <p id="ubicacion-error" className="text-sm text-sequia" role="alert">
          {error}
        </p>
      ) : null}

      <details
        className="rounded-xl border border-pila bg-papel motion-reduce:transition-none"
        open={mapaAbierto}
        onToggle={(evento) => setMapaAbierto(evento.currentTarget.open)}
      >
        <summary className="min-h-11 cursor-pointer px-3 py-2 text-base font-semibold text-pozo">
          Ajustar en el mapa
        </summary>
        <div className="border-t border-pila p-3">
          {mapaAbierto ? (
            <SelectorPunto
              valor={tomada ? valor : null}
              onChange={(punto) => {
                setLatManual(String(punto.lat));
                setLngManual(String(punto.lng));
                setErrorGps(null);
                onChange(punto);
              }}
              centroInicial={MAP_CENTER}
            />
          ) : null}
        </div>
      </details>

      {!mapaAbierto ? (
        <details
          className="rounded-xl border border-pila bg-papel motion-reduce:transition-none"
          open={manualAbierto}
          onToggle={(evento) => setManualAbierto(evento.currentTarget.open)}
        >
          <summary className="min-h-11 cursor-pointer px-3 py-2 text-base font-semibold text-pozo">
            Escribir coordenadas a mano
          </summary>
          <div className="grid grid-cols-1 gap-3 border-t border-pila p-3 sm:grid-cols-2">
            <Campo id="lat" label="Latitud">
              <input
                name="lat"
                type="number"
                inputMode="decimal"
                step="0.0001"
                value={latManual}
                onChange={(evento) => aplicarManual("lat", evento.target.value)}
                className={`${CLASE_INPUT} font-mono`}
              />
            </Campo>
            <Campo id="lng" label="Longitud">
              <input
                name="lng"
                type="number"
                inputMode="decimal"
                step="0.0001"
                value={lngManual}
                onChange={(evento) => aplicarManual("lng", evento.target.value)}
                className={`${CLASE_INPUT} font-mono`}
              />
            </Campo>
          </div>
        </details>
      ) : null}
    </fieldset>
  );
}
