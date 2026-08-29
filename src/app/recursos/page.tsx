import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recursos",
};

const TIPS = [
  {
    title: "Sin servicio",
    items: [
      "Reserva el agua que ya tengas para beber y cocinar.",
      "Evita abrir la llave una y otra vez: no acelera el restablecimiento.",
      "Reporta el corte para que tu zona quede visible en las alertas.",
    ],
  },
  {
    title: "Fuga visible",
    items: [
      "Cierra la llave de paso si está en tu vivienda.",
      "Aléjate si el agua está mezclada con cables o un socavón.",
      "Describe el punto exacto en el reporte: calle, pasaje o referencia.",
    ],
  },
  {
    title: "Agua de aspecto extraño",
    items: [
      "No la uses para beber ni preparar alimentos.",
      "Hierve el agua solo si tu autoridad local lo recomienda.",
      "Anota color, olor y desde cuándo lo notas.",
    ],
  },
];

export default function ResourcesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-sky-950">
        Qué hacer mientras llega ayuda
      </h1>
      <p className="mt-2 text-slate-600">
        Guía rápida para cuando falta el agua. Si hay riesgo inmediato,
        contacta también a los servicios de tu localidad.
      </p>

      <div className="mt-8 grid gap-4">
        {TIPS.map((tip) => (
          <article
            key={tip.title}
            className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-sky-950">{tip.title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              {tip.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-rose-50 p-5">
        <p className="font-semibold text-rose-900">¿Sigues sin agua?</p>
        <p className="mt-1 text-sm text-rose-800">
          Reporta la escasez para que tu zona quede visible y recibas las fuentes de
          suministro más cercanas.
        </p>
        <Link
          href="/reportar"
          className="mt-4 inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Reportar escasez
        </Link>
      </div>
    </main>
  );
}
