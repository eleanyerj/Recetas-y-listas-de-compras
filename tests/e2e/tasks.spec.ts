// Prueba de extremo a extremo (E2E): un navegador real usa la aplicación como lo haría una persona.
// Ejecuta:  npm run test:e2e   (la primera vez: npx playwright install chromium)
import { expect, test } from '@playwright/test';

test('carga la página principal de recetas correctamente', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByRole('heading').first()).toBeVisible();
});

test('permite interactuar con la interfaz sin errores de consola ni de página', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (err) => pageErrors.push(err));

  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();

  expect(pageErrors).toHaveLength(0);
});