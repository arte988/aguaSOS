import { FormularioReporte } from "./_components/FormularioReporte";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
          Reporte de escasez
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-sky-950 dark:text-sky-50">
          ¿Dónde falta el agua?
        </h1>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          No necesitás cuenta. El reporte entra al mapa y te devolvemos los
          suministradores más cercanos con su teléfono.
        </p>
      </header>
      <FormularioReporte />
    </main>
  );
}
