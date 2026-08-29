"use client";

import dynamic from "next/dynamic";
import type { MapaBaseProps } from "./mapa-contrato";

const DynamicMapCanvas = dynamic<MapaBaseProps>(
  () => import("./MapaCanvas").then((module) => module.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="grid h-full min-h-80 w-full place-items-center rounded-2xl bg-sky-50 text-sm text-sky-900"
        role="status"
        aria-live="polite"
      >
        Cargando mapa…
      </div>
    ),
  },
);

export function MapaBase(props: MapaBaseProps) {
  return <DynamicMapCanvas {...props} />;
}
