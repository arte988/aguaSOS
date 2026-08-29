import type { Metadata } from "next";
import { Suspense } from "react";
import { TableroCartografico } from "@/components/mapa/TableroCartografico";

export const metadata: Metadata = {
  title: "Tablero",
};

export default function TableroPage() {
  return (
    <Suspense
      fallback={
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">Cargando tablero…</p>
      }
    >
      <TableroCartografico />
    </Suspense>
  );
}