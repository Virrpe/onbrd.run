import { test, expect } from '@playwright/test';

test('runner is alive', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
