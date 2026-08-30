import { expect, test } from "@playwright/test";

test("el mapa termina de cargar y muestra sus controles", async ({ page }) => {
  await page.goto("/mapa");

  await expect(page.getByText("Cargando mapa…", { exact: true })).toHaveCount(0, {
    timeout: 10_000,
  });
  await expect(page.getByRole("button", { name: "Acercar mapa" })).toBeVisible();
});
