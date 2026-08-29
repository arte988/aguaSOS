"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "./ConvexClientProvider";

export function ConvexStatus() {
  if (!isConvexConfigured()) {
    return (
      <p className="max-w-lg text-left text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Convex aún no está vinculado. En esta carpeta ejecuta{" "}
        <code className="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[0.85em] text-sky-800 dark:bg-sky-900 dark:text-sky-200">
          npx convex dev
        </code>
        , inicia sesión con tu cuenta y crea o elige el proyecto. Eso escribe{" "}
        <code className="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-[0.85em] text-sky-800 dark:bg-sky-900 dark:text-sky-200">
          NEXT_PUBLIC_CONVEX_URL
        </code>{" "}
        en <code className="font-mono">.env.local</code>.
      </p>
    );
  }

  return <LivePing />;
}

function LivePing() {
  const status = useQuery(api.health.ping);

  if (status === undefined) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Conectando con Convex…
      </p>
    );
  }

  return (
    <p className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      Backend {status.backend} · {status.app} listo
    </p>
  );
}
