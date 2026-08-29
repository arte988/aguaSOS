import { expect, test, type Page } from "@playwright/test";

async function abrirFormularioLimpio(page: Page) {
  await page.addInitScript(() => {
    const err = { code: 1, PERMISSION_DENIED: 1, message: "denied" };
    Object.defineProperty(navigator.geolocation, "getCurrentPosition", {
      configurable: true,
      value: (_ok: unknown, ko: (error: unknown) => void) => ko(err),
    });
  });
  await page.goto("/reportar");
  await page.evaluate(() => localStorage.removeItem("aguasos.borrador-reporte"));
  await page.reload();
  await expect(page.getByRole("button", { name: "Enviar el reporte" })).toBeVisible();
}

test.describe("reportar", () => {
  test("el envío vacío enfoca el resumen y enlaza a cada campo", async ({ page }) => {
    await abrirFormularioLimpio(page);

    await page.getByRole("button", { name: "Enviar el reporte" }).click();

    const resumen = page.getByRole("alert").filter({ has: page.getByText("Hay un problema") });
    await expect(resumen).toBeVisible();
    await expect(resumen).toBeFocused();
    await expect(page.locator("a[href='#ubicacion']")).toBeVisible();
    await expect(page.locator("a[href='#personas']")).toBeVisible();
    await expect(page.locator("a[href='#impacto']")).toBeVisible();
  });

  test("GPS denegado abre coordenadas a mano y el error se limpia al marcar", async ({
    page,
  }) => {
    await abrirFormularioLimpio(page);

    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await expect(page.getByText("No se dio permiso de ubicación")).toBeVisible();
    await expect(page.locator("#lat")).toBeVisible();
    await expect(page.locator("#lng")).toBeVisible();

    await page.locator("#lat").fill("13.7000");
    await page.locator("#lng").fill("-89.2000");
    await expect(page.getByText("Ubicación tomada")).toBeVisible();
    await expect(page.getByText("No se dio permiso de ubicación")).toHaveCount(0);
  });

  test("el envío completo llega al mapa con folio y teléfono", async ({ page }) => {
    await abrirFormularioLimpio(page);

    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await page.locator("#lat").fill("13.7000");
    await page.locator("#lng").fill("-89.2000");
    await page.getByRole("button", { name: "1 a 5", exact: true }).click();
    await page.getByRole("button", { name: /^Casa/ }).click();
    await page.getByRole("button", { name: "Enviar el reporte" }).click();

    await expect(page).toHaveURL(/\/mapa\?.*reporteId=/);
    await expect(page.getByRole("heading", { name: "Tu reporte quedó en el mapa" })).toBeVisible();
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Llamar / }).first()).toBeVisible();
  });

  test("prefers-color-scheme dark no oscurece la pantalla", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/reportar");

    const fondo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(fondo).toBe("rgb(244, 250, 255)");
    await expect(page.locator("main [class*='dark:']")).toHaveCount(0);
  });
});
