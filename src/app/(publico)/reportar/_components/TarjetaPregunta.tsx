import type { ReactNode } from "react";

export function TarjetaPregunta({
  id,
  respondida,
  children,
}: {
  id?: string;
  respondida: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`rounded-2xl border bg-papel p-4 motion-reduce:transition-none ${
        respondida ? "border-pila border-l-4 border-l-pila" : "border-pila"
      }`}
    >
      {children}
    </section>
  );
}
