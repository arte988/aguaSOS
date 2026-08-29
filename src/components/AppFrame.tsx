"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMap = pathname === "/mapa" || pathname.startsWith("/mapa/");

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
