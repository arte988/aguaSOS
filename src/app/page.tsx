export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[var(--background)] px-6">
      <main className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <p className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-sm font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300">
          Next.js · React · Tailwind CSS
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-sky-700 dark:text-sky-300 sm:text-6xl">
          aguaSOS
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          El proyecto está listo. Edita{" "}
          <code className="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[0.9em] text-sky-800 dark:bg-sky-900 dark:text-sky-200">
            src/app/page.tsx
          </code>{" "}
          para empezar a construir.
        </p>
      </main>
    </div>
  );
}
