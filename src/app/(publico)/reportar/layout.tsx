import type { ReactNode } from "react";
import { EstadoConexion } from "@/components/EstadoConexion";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <EstadoConexion />
      {children}
    </>
  );
}
