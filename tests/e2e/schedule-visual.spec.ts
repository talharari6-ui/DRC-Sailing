import { expect, test } from '@playwright/test';

const loginCode = process.env.E2E_LOGIN_CODE;

async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('input[type="text"]').first().fill(loginCode!);
  await page.locator('button[type="submit"]').first().click();
  await expect(page).toHaveURL(/\/schedule/);
}

test.describe('schedule visual sanity', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!loginCode, 'Set E2E_LOGIN_CODE to run schedule visual tests.');
    await login(page);
  });

  test('schedule page renders key controls', async ({ page }) => {
    await expect(page).toHaveURL(/\/schedule/);
    await expect(page.locator('button').filter({ hasText: /שבוע|×©×‘×•×¢/ }).first()).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /חודש|×—×•×“×©/ }).first()).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /יום|×™×•×/ }).first()).toBeVisible();
  });

  test('schedule page does not contain obvious mojibake markers', async ({ page }) => {
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('Ã');
    expect(bodyText).not.toContain('â€¢');
    expect(bodyText).not.toContain('Ã—');
    expect(bodyText).not.toContain('Â');
  });
});
