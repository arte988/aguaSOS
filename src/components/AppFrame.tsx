"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { precargarCartografia } from "@/components/mapa/precargar";

const RUTAS_CON_MAPA = ["/mapa", "/reportar", "/tablero"];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMap = pathname === "/mapa" || pathname.startsWith("/mapa/");

  useEffect(() => {
    if (RUTAS_CON_MAPA.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`))) {
      precargarCartografia();
    }
  }, [pathname]);

  return (
    <div
      className={
        isMap
          ? "flex h-dvh min-h-0 flex-col overflow-hidden"
          : "flex min-h-full flex-col"
      }
    >
      <Header />
      <div
        className={
          isMap
            ? "relative min-h-0 min-w-0 flex-1"
            : "flex min-h-0 flex-1 flex-col"
        }
      >
        {children}
      </div>
      {isMap ? null : <Footer />}
    </div>
  );
}
