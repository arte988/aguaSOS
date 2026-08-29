import Link from "next/link";

const STEPS = [
  {
    title: "Reporta la escasez",
    text: "Dónde y desde cuándo falta el agua, en tu casa, cuadra o comunidad. Sin necesidad de cuenta.",
  },
  {
    title: "Encuentra dónde abastecerte",
    text: "Te mostramos las fuentes de suministro más cercanas con su teléfono para que puedas abastecerte.",
  },
  {
    title: "¿Tienes agua para compartir?",
    text: "Si tienes pozo, nacimiento, tanque o vendes agua, regístrate como suministrador y apareces visible en el mapa cuando alguien reporta cerca.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div>
          <p className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
            Escasez de agua
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-sky-950 sm:text-5xl">
            Reporta la escasez y encuentra dónde abastecerte.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-slate-600">
            Reporta la escasez en tu casa, tu cuadra o tu comunidad y te mostramos las
            fuentes de suministro más cercanas. Si tienes pozo, un nacimiento o venta de
            agua, regístrate como suministrador para quedar visible cuando alguien te necesite.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reportar"
              className="rounded-full bg-rose-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-rose-700"
            >
              Reportar escasez
            </Link>
          </div>
        </div>

        <aside className="rounded-3xl bg-sky-800 p-6 text-sky-50 shadow-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
            Prioridad
          </p>
          <p className="mt-3 text-2xl font-semibold">Si no hay agua ahora</p>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-sky-100">
            <li>Usa agua embotellada o previamente almacenada para beber.</li>
            <li>Cierra la llave si ves una fuga y avisa en el reporte.</li>
            <li>No bebas agua con olor, color o sabor extraño.</li>
          </ul>
          <Link
            href="/recursos"
            className="mt-6 inline-flex text-sm font-semibold text-white underline-offset-4 hover:underline"
          >
            Ver qué hacer →
          </Link>
        </aside>
      </section>

      <section className="border-t border-sky-100 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.title} className="rounded-2xl bg-sky-50 p-5">
              <p className="text-sm font-bold text-sky-700">0{index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold text-sky-950">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
