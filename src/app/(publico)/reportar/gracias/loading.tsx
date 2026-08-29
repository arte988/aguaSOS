"use client";

import { useOffline } from "next/offline";

export default function Loading() {
  const isOffline = useOffline();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-8">
      <p className="text-base text-zinc-700 dark:text-zinc-300">
        {isOffline
          ? "Sin conexión. Las fuentes cercanas van a aparecer cuando vuelva la red."
          : "Cargando…"}
      </p>
    </main>
  );
}
