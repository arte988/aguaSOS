"use client";

import { formatearNumero } from "@/lib/formato";
import { CLASE_BOTON_PRIMARIO } from "../_lib/clases";
import { ETIQUETA_SUMINISTRO } from "../_lib/constantes";
import type { FuenteCercana } from "../_lib/tipos";
import { useFuentesCercanas } from "../_lib/useFuentesCercanas";
import { IconoTelefono } from "./iconos";

function telefonoHref(telefono: string): string {
  const digits = telefono.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

function TarjetaFuente({
  fuente,
  destacada,
}: {
  fuente: FuenteCercana;
  destacada: boolean;
}) {
  return (
    <li
      className={`rounded-2xl border border-pila bg-papel p-4 ${
        destacada ? "border-l-4 border-l-pila" : ""
      }`}
    >
      <p className={destacada ? "text-2xl font-semibold text-pozo" : "text-lg font-semibold text-pozo"}>
        {fuente.nombreLugar}
      </p>
      <p className="mt-1 text-sm text-foreground/70">
        {fuente.tiposSuministro.map((tipo) => ETIQUETA_SUMINISTRO[tipo]).join(" · ")}
        {" · "}
        {fuente.tieneTransporte ? "Con transporte" : "Sin transporte"}
      </p>
      <p className="mt-1 font-mono text-sm text-pozo">
        {formatearNumero(fuente.distanciaKm, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}{" "}
        km
        {" · "}
        {fuente.contactoTelefono}
      </p>
      {/* Boton no acepta `as`; copiamos el primario hasta que Vía 3 lo agregue. */}
      <a href={telefonoHref(fuente.contactoTelefono)} className={`mt-3 ${CLASE_BOTON_PRIMARIO}`}>
        <IconoTelefono />
        Llamar {fuente.contactoTelefono}
      </a>
    </li>
  );
}

interface FuentesCercanasProps {
  lat: number;
  lng: number;
}

export function FuentesCercanas({ lat, lng }: FuentesCercanasProps) {
  const { fuentes, error } = useFuentesCercanas(lat, lng);

  if (fuentes === undefined) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" role="status">
        <div className="min-h-40 animate-pulse rounded-2xl bg-pila motion-reduce:animate-none" />
        <div className="min-h-28 animate-pulse rounded-2xl bg-pila motion-reduce:animate-none" />
        <p className="sr-only">Buscando fuentes cercanas…</p>
      </div>
    );
  }

  if (fuentes.length === 0) {
    return (
      <div className="rounded-2xl border border-pila bg-papel p-4">
        <p className="text-base text-foreground">
          No hay fuentes cerca de ese punto todavía. Volvé al formulario o llamá a tu alcaldía.
        </p>
      </div>
    );
  }

  const [primera, ...resto] = fuentes;

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm text-aviso" role="status">
          No se pudo consultar el servidor. Mostramos fuentes de referencia.
        </p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {primera ? (
          <TarjetaFuente
            key={`${primera.nombreLugar}-${primera.contactoTelefono}`}
            fuente={primera}
            destacada
          />
        ) : null}
        {resto.map((fuente) => (
          <TarjetaFuente
            key={`${fuente.nombreLugar}-${fuente.contactoTelefono}`}
            fuente={fuente}
            destacada={false}
          />
        ))}
      </ul>
    </div>
  );
}
