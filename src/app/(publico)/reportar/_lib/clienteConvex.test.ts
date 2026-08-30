import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node 22 runs this test directly from TypeScript and needs the extension.
import { crearReporteEnConvex } from "./clienteConvex.ts";

test("no finge éxito cuando falta la URL de Convex", async () => {
  const anterior = process.env.NEXT_PUBLIC_CONVEX_URL;
  delete process.env.NEXT_PUBLIC_CONVEX_URL;

  try {
    await assert.rejects(
      crearReporteEnConvex({
        claveIdempotencia: "prueba-reportar-sin-convex",
        lat: 13.6929,
        lng: -89.2182,
        escasezDesde: Date.now(),
        personasRango: "1-5",
        menores: 0,
        impacto: "casa",
        afectacionEconomica: [],
      }),
      /Falta NEXT_PUBLIC_CONVEX_URL/,
    );
  } finally {
    if (anterior === undefined) delete process.env.NEXT_PUBLIC_CONVEX_URL;
    else process.env.NEXT_PUBLIC_CONVEX_URL = anterior;
  }
});
