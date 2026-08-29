"use client";

import { useState } from "react";
import { interpretarVector, type VectorCoordenadas } from "./logica";
import { MapCanvas } from "./MapaCanvas";
import { MAP_BOUNDS } from "./tiles";
import type { Punto, SelectorPuntoProps } from "./tipos";

function roundTripKey(point: Punto | null | undefined): string {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
    return "vacio";
  }
  return `${point.lat}:${point.lng}`;
}

export function SelectorPunto({
  valor,
  onChange,
  centroInicial,
}: SelectorPuntoProps) {
  return (
    <div className="flex flex-col gap-3">
      <MapCanvas
        ariaLabel="Mapa para elegir la ubicación del reporte"
        className="h-80 min-h-80"
        center={valor ?? centroInicial}
        initialZoom={8}
        selectedPoint={valor}
        onMapClick={(point) => onChange({ lat: point.lat, lng: point.lng })}
        onMarkerDragEnd={(point) => onChange({ lat: point.lat, lng: point.lng })}
        showMarker
        markerDraggable
      >
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm">
          Tocá el mapa para marcar el punto o arrastrá el marcador.
        </div>
      </MapCanvas>

      {/* El borrador vive en este subcomponente; la key lo remonta solo cuando
          el valor controlado cambia desde fuera, sin recrear el mapa. */}
      <InputsPunto key={roundTripKey(valor)} valor={valor} onChange={onChange} />
    </div>
  );
}

function InputsPunto({
  valor,
  onChange,
}: {
  valor: SelectorPuntoProps["valor"];
  onChange: SelectorPuntoProps["onChange"];
}) {
  const [vector, setVector] = useState<VectorCoordenadas>(() => toVector(valor));

  function vectorChanged(next: VectorCoordenadas) {
    setVector(next);
    // Un borrador inválido o incompleto no emite un punto nuevo; un punto
    // globalmente válido fuera de límites se conserva y solo se advierte. La
    // última selección válida permanece.
    const resultado = interpretarVector(next, MAP_BOUNDS);
    if (resultado.tipo === "punto" || resultado.tipo === "fuera") {
      onChange(resultado.punto);
    }
  }

  const resultado = interpretarVector(vector, MAP_BOUNDS);
  const invalid = resultado.tipo === "invalido" || resultado.tipo === "parcial";
  const warning =
    resultado.tipo === "fuera"
      ? "El punto está fuera de los límites aproximados de El Salvador. Se conserva, pero revisá las coordenadas."
      : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Coordenadas del punto">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-sky-950">Latitud</span>
          <input
            type="number"
            step="0.000001"
            inputMode="decimal"
            value={vector.lat}
            onChange={(event) => vectorChanged({ ...vector, lat: event.target.value })}
            aria-invalid={invalid}
            aria-describedby={invalid ? "selector-error" : undefined}
            className="input"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-sky-950">Longitud</span>
          <input
            type="number"
            step="0.000001"
            inputMode="decimal"
            value={vector.lng}
            onChange={(event) => vectorChanged({ ...vector, lng: event.target.value })}
            aria-invalid={invalid}
            aria-describedby={invalid ? "selector-error" : undefined}
            className="input"
          />
        </label>
      </div>

      <div aria-live="polite">
        {resultado.tipo === "parcial" ? (
          <p id="selector-error" className="text-sm text-rose-700">
            Completá ambas coordenadas para fijar el punto.
          </p>
        ) : resultado.tipo === "invalido" ? (
          <p id="selector-error" className="text-sm text-rose-700">
            Las coordenadas deben ser números válidos entre −90 y 90 / −180 y 180.
          </p>
        ) : null}
      </div>

      {warning ? (
        <p className="text-sm text-amber-800" role="status">
          {warning}
        </p>
      ) : null}

      {valor && valor.precisionM !== undefined ? (
        <p className="text-sm text-slate-600">
          Precisión del GPS: {Math.round(valor.precisionM)} m
        </p>
      ) : null}
    </div>
  );
}

function toVector(punto?: Punto | null): VectorCoordenadas {
  if (!punto || !Number.isFinite(punto.lat) || !Number.isFinite(punto.lng)) {
    return { lat: "", lng: "" };
  }
  return { lat: String(punto.lat), lng: String(punto.lng) };
}
