"use client";

import { useId, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  borrarBorrador,
  leerBorradorCliente,
  leerBorradorServidor,
  parchearBorrador,
  suscribirBorrador,
} from "../_lib/borrador";
import { IMPACTOS, RANGOS_PERSONAS } from "../_lib/constantes";
import { hoyLocalYmd, ymdAEpochMsLocal } from "../_lib/fechas";
import type { Afectacion, PuntoElegido } from "../_lib/tipos";
import { useEnviarReporte } from "../_lib/useEnviarReporte";
import { Boton, Campo } from "./campos";
import { SelectorPuntoLocal } from "./SelectorPuntoLocal";

function mapearAfectacion(texto: string): Afectacion[] {
  const descripcion = texto.trim();
  if (!descripcion) return [];
  return [{ tipo: "otra", descripcion }];
}

const inputClase =
  "min-h-11 w-full rounded-xl border border-sky-200 bg-white px-3 text-base text-sky-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:border-sky-800 dark:bg-zinc-900 dark:text-sky-50";

export function FormularioReporte() {
  const router = useRouter();
  const enviar = useEnviarReporte();
  const errorVivoId = useId();
  const borrador = useSyncExternalStore(
    suscribirBorrador,
    leerBorradorCliente,
    leerBorradorServidor,
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const { punto, personasRango, impacto, escasezDesde, menores, canton, afectacion, claveIdempotencia } =
      borrador;

    if (!punto || !Number.isFinite(punto.lat) || !Number.isFinite(punto.lng)) {
      setError("Marcá el punto: usá tu ubicación o escribí latitud y longitud.");
      return;
    }
    if (!personasRango) {
      setError("Elegí cuántas personas están sin agua.");
      return;
    }
    if (!impacto) {
      setError("Elegí si afecta a una casa, un pasaje o la comunidad.");
      return;
    }
    if (!escasezDesde) {
      setError("Indicá desde cuándo hay escasez.");
      return;
    }

    const menoresNumero = Number(menores);
    if (!Number.isFinite(menoresNumero) || menoresNumero < 0) {
      setError("El número de menores no puede ser negativo.");
      return;
    }

    setEnviando(true);
    try {
      const resultado = await enviar({
        claveIdempotencia,
        lat: punto.lat,
        lng: punto.lng,
        ...(punto.precisionM !== undefined ? { precisionM: punto.precisionM } : {}),
        ...(canton.trim() ? { canton: canton.trim() } : {}),
        escasezDesde: ymdAEpochMsLocal(escasezDesde),
        personasRango,
        menores: menoresNumero,
        impacto,
        afectacionEconomica: mapearAfectacion(afectacion),
      });

      borrarBorrador();

      const params = new URLSearchParams({
        lat: String(punto.lat),
        lng: String(punto.lng),
        reporteId: resultado.reporteId,
      });
      router.push(`/reportar/gracias?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el reporte. Revisá la conexión e intentá de nuevo.",
      );
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <SelectorPuntoLocal
        valor={borrador.punto}
        onChange={(punto: PuntoElegido) => parchearBorrador({ punto })}
      />

      <fieldset>
        <legend className="mb-3 text-base font-medium text-sky-950 dark:text-sky-100">
          ¿Cuántas personas están sin agua?
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-required="true">
          {RANGOS_PERSONAS.map((rango) => {
            const seleccionado = borrador.personasRango === rango.valor;
            return (
              <button
                key={rango.valor}
                type="button"
                role="radio"
                aria-checked={seleccionado}
                onClick={() => parchearBorrador({ personasRango: rango.valor })}
                className={`min-h-11 min-w-11 rounded-full px-4 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                  seleccionado
                    ? "bg-sky-800 text-white dark:bg-sky-500"
                    : "border border-sky-200 bg-white text-sky-900 dark:border-sky-800 dark:bg-zinc-900 dark:text-sky-100"
                }`}
              >
                {rango.etiqueta}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Campo
        id="menores"
        label="¿Cuántos son niños o niñas?"
        pista="Si no hay menores, dejalo en 0."
      >
        <input
          id="menores"
          name="menores"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          required
          aria-describedby="menores-pista"
          value={borrador.menores}
          onChange={(e) => parchearBorrador({ menores: e.target.value })}
          className={inputClase}
        />
      </Campo>

      <fieldset>
        <legend className="mb-3 text-base font-medium text-sky-950 dark:text-sky-100">
          ¿A qué alcanza la falta de agua?
        </legend>
        <div className="flex flex-col gap-2">
          {IMPACTOS.map((opcion) => {
            const seleccionado = borrador.impacto === opcion.valor;
            return (
              <button
                key={opcion.valor}
                type="button"
                aria-pressed={seleccionado}
                onClick={() => parchearBorrador({ impacto: opcion.valor })}
                className={`min-h-11 rounded-2xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                  seleccionado
                    ? "bg-sky-800 text-white dark:bg-sky-500"
                    : "border border-sky-200 bg-white text-sky-950 dark:border-sky-800 dark:bg-zinc-900 dark:text-sky-50"
                }`}
              >
                <span className="block text-base font-semibold">{opcion.etiqueta}</span>
                <span
                  className={`block text-sm ${seleccionado ? "text-sky-100" : "text-zinc-600 dark:text-zinc-400"}`}
                >
                  {opcion.ejemplo}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Campo id="escasezDesde" label="¿Desde cuándo hay escasez?">
        <input
          id="escasezDesde"
          name="escasezDesde"
          type="date"
          required
          max={hoyLocalYmd()}
          value={borrador.escasezDesde}
          onChange={(e) => parchearBorrador({ escasezDesde: e.target.value })}
          className={inputClase}
        />
      </Campo>

      <Campo
        id="canton"
        label="Cantón o colonia (opcional)"
        pista="Texto libre. No hace falta que coincida con un catálogo."
      >
        <input
          id="canton"
          name="canton"
          type="text"
          autoComplete="address-level3"
          aria-describedby="canton-pista"
          value={borrador.canton}
          onChange={(e) => parchearBorrador({ canton: e.target.value })}
          className={inputClase}
        />
      </Campo>

      <Campo
        id="afectacion"
        label="Afectación económica (opcional)"
        pista="Si se perdió siembra u otro ingreso, describilo. Si no, dejalo vacío."
      >
        <textarea
          id="afectacion"
          name="afectacion"
          rows={3}
          aria-describedby="afectacion-pista"
          value={borrador.afectacion}
          onChange={(e) => parchearBorrador({ afectacion: e.target.value })}
          className={`${inputClase} py-2`}
        />
      </Campo>

      <div aria-live="polite" aria-atomic="true" id={errorVivoId} className="min-h-6">
        {error ? <p className="text-base text-red-700 dark:text-red-400">{error}</p> : null}
      </div>

      <Boton type="submit" disabled={enviando} className="w-full">
        {enviando ? "Enviando…" : "Enviar reporte"}
      </Boton>
    </form>
  );
}
