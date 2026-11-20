import { expect, test } from "@playwright/test";

test("la portada carga y muestra el titular principal", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/UP10/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('nav[aria-label="Navegación principal"]')).toBeAttached();
});

test("el enlace de salto apunta al contenido", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skipLink).toHaveAttribute("href", "#contenido");
});
