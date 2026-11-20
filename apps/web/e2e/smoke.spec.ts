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

test("las tipografías locales cargan", async ({ page }) => {
  await page.goto("/");

  const loaded = await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('600 42px "Integral CF"'),
      document.fonts.load('400 80px "Anton"'),
      document.fonts.load('400 18px "Gelasio"'),
    ]);

    return {
      integral: document.fonts.check('600 42px "Integral CF"'),
      anton: document.fonts.check('400 80px "Anton"'),
      gelasio: document.fonts.check('400 18px "Gelasio"'),
    };
  });

  expect(loaded).toEqual({ integral: true, anton: true, gelasio: true });
});
