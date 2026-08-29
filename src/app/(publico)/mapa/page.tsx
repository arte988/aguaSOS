"use client";

import dynamic from "next/dynamic";

const MapaFuentesPublico = dynamic(
  () => import("@/components/mapa/MapaFuentesPublico").then((mod) => mod.MapaFuentesPublico),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full min-h-80 w-full place-items-center bg-sky-50 text-sm text-sky-900">
        Cargando mapa…
      </div>
    ),
  }
);

export default function MapaPage() {
  return (
    <div className="absolute inset-0 min-h-0 w-full">
      <MapaFuentesPublico />
    </div>
  );
}
