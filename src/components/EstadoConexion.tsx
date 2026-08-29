"use client";

import { useOffline } from "next/offline";

interface EstadoConexionProps {
  pendientes?: number;
}

export function EstadoConexion({ pendientes = 0 }: EstadoConexionProps) {
  const isOffline = useOffline();

  if (!isOffline && pendientes === 0) return null;

  const mensaje = isOffline
    ? pendientes > 0
      ? `${pendientes} ${pendientes === 1 ? "reporte esperando" : "reportes esperando"} conexión.`
      : "Sin conexión. Lo que envíes se reintenta al volver la red."
    : `${pendientes} ${pendientes === 1 ? "reporte pendiente" : "reportes pendientes"} de sincronizar.`;

  return (
    <div
      role="status"
      className="border-b border-amber-300 bg-amber-100 px-4 py-3 text-center text-sm font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      {mensaje}
    </div>
  );
}
