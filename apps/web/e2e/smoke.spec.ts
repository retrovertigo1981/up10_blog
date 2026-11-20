import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function gotoHome(page: Page) {
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
}

test("la portada carga y muestra el titular principal", async ({ page }) => {
  await gotoHome(page);

  await expect(page).toHaveTitle(/UP10/);
  await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await expect(page.locator('nav[aria-label="Navegación principal"]')).toBeAttached();
});

test("el enlace de salto apunta al contenido", async ({ page }) => {
  await gotoHome(page);

  const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skipLink).toHaveAttribute("href", "#contenido");
});

test("la portada muestra las secciones principales", async ({ page }) => {
  await gotoHome(page);

  for (const heading of ["LO ÚLTIMO", "UP10 PLAYLIST", "ENTREVISTAS", "INSTAGRAM"]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: "SUSCRÍBETE AL PULSO" })).toBeAttached();
});

test("el carrusel del hero navega entre las tres noticias", async ({ page }) => {
  await gotoHome(page);

  const region = page.getByRole("region", { name: "Noticias destacadas" });
  await expect(region).toBeVisible();

  const second = page.getByRole("button", { name: /Ir a la noticia 2/ });
  await second.click();
  await expect(second).toHaveAttribute("aria-current", "true");
});

test("la página TOP 10 muestra el ranking", async ({ page }) => {
  await page.goto("/top10");
  await page.waitForSelector("html[data-hydrated]");

  await expect(page.getByRole("heading", { level: 1, name: "UP10 TOP 10" })).toBeVisible();
  await expect(page.locator("ol > li")).toHaveCount(10);
  await expect(page.getByText("Nuevo").first()).toBeVisible();
});

test("el menú se abre y se cierra con teclado", async ({ page }) => {
  await gotoHome(page);

  await page.getByRole("button", { name: "Abrir menú" }).click();

  const dialog = page.getByRole("dialog", { name: "Menú de navegación" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "UP10 Unplugged" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("las tipografías locales cargan", async ({ page }) => {
  await gotoHome(page);

  const loaded = await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('700 42px "Integral CF"'),
      document.fonts.load('400 80px "Anton"'),
      document.fonts.load('400 18px "Gelasio"'),
    ]);

    return {
      integral: document.fonts.check('700 42px "Integral CF"'),
      anton: document.fonts.check('400 80px "Anton"'),
      gelasio: document.fonts.check('400 18px "Gelasio"'),
    };
  });

  expect(loaded).toEqual({ integral: true, anton: true, gelasio: true });
});
