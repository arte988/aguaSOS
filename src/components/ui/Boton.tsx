import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primario" | "secundario" | "peligro";

export function Boton({
  variante = "primario",
  className = "",
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  children: ReactNode;
}) {
  const base =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl px-4 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const estilos: Record<Variante, string> = {
    primario:
      "border-l-4 border-l-pila bg-pozo text-white hover:bg-chorro focus-visible:outline-pozo",
    secundario:
      "border border-pila bg-papel text-pozo hover:bg-pila focus-visible:outline-chorro",
    peligro:
      "bg-sequia text-white hover:bg-sequia/90 focus-visible:outline-sequia",
  };

  return (
    <button type={type} className={`${base} ${estilos[variante]} ${className}`} {...props}>
      {children}
    </button>
  );
}
