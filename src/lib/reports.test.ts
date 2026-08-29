import assert from "node:assert/strict";
import test from "node:test";

// reports.ts lee `window.localStorage` al importarse, así que hay que montar el
// stub antes del import dinámico.
const almacen = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => almacen.get(k) ?? null,
    setItem: (k: string, v: string) => void almacen.set(k, v),
  },
};

const {
  leerReportesCliente,
  leerReportesServidor,
  saveReport,
  suscribirReportes,
// @ts-expect-error Node 22 ejecuta este test desde TypeScript y necesita la extensión.
} = await import("./reports.ts");

test("guardar un reporte invalida la caché y notifica a los suscriptores", () => {
  const antes = leerReportesCliente();
  assert.equal(leerReportesCliente(), antes, "misma referencia sin cambios");

  let avisos = 0;
  const desuscribir = suscribirReportes(() => {
    avisos += 1;
  });

  saveReport({
    id: "1",
    code: "ABC123",
    type: "fuga",
    name: "Ana",
    phone: "7000-0000",
    municipality: "San Salvador",
    neighborhood: "Centro",
    address: "Calle 1",
    description: "Tubería rota",
    peopleAffected: 4,
    createdAt: new Date().toISOString(),
    status: "recibido",
  });

  assert.equal(avisos, 1, "el suscriptor recibe el aviso");

  const despues = leerReportesCliente();
  assert.notEqual(despues, antes, "nueva referencia tras guardar");
  assert.equal(despues.length, antes.length + 1);
  assert.ok(despues.some((r) => r.code === "ABC123"));

  desuscribir();
});

test("el snapshot de servidor es estable entre llamadas", () => {
  assert.equal(leerReportesServidor(), leerReportesServidor());
});
