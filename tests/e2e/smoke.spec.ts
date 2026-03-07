import { expect, test } from '@playwright/test';

const loginCode = process.env.E2E_LOGIN_CODE;

test('login page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('input[type="text"]').first()).toBeVisible();
  await expect(page.locator('button[type="submit"]').first()).toBeVisible();
});

test('coach can login and open core pages', async ({ page }) => {
  test.skip(!loginCode, 'Set E2E_LOGIN_CODE to run authenticated smoke test.');

  await page.goto('/');
  await page.locator('input[type="text"]').first().fill(loginCode!);
  await page.locator('button[type="submit"]').first().click();

  await expect(page).toHaveURL(/\/schedule/);
  await expect(page.locator('h1').first()).toBeVisible();

  await page.goto('/sailors');
  await expect(page).toHaveURL(/\/sailors/);
  await expect(page.locator('h1').first()).toBeVisible();

  await page.goto('/hours');
  await expect(page).toHaveURL(/\/hours/);
  await expect(page.locator('h1').first()).toBeVisible();
});
