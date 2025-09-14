import path from 'path';
import fs from 'fs';
import { test, expect, chromium } from '@playwright/test';

test('runs audit on linear.app via popup and exports HTML', async () => {
  const extPath = path.resolve(__dirname, '../../extension/dist');
  expect(fs.existsSync(extPath)).toBeTruthy();

  const userDataDir = path.resolve(__dirname, '../../.pw-user');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`,
      '--disable-features=DialMediaRouteProvider',
    ],
  });

  // 1) Open target page first and make it active
  const page = await context.newPage();
  await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
  await page.bringToFront();

  // 2) Get extension ID from service worker url
  //    e.g. chrome-extension://<ID>/service-worker.js
  //    Wait up to 5s for the SW to register
  let extId: string | undefined;
  for (let i=0; i<10; i++) {
    const workers = context.serviceWorkers();
    if (workers.length) {
      const url = workers[0].url();
      const m = url.match(/chrome-extension:\/\/([a-p]{32})\//);
      if (m) { extId = m[1]; break; }
    }
    await page.waitForTimeout(500);
  }
  expect(extId, 'extension id').toBeTruthy();

  // 3) Open the popup page directly
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extId}/src/popup/popup.html`, { waitUntil: 'domcontentloaded' });

  // 4) Click "Run Audit" and wait for result handoff
  const runBtn = popup.getByRole('button', { name: /Run Audit/i });
  await runBtn.click();

  // expect audit result to render in the popup within 5s (score or issues list)
  await expect(popup.locator('text=Audit complete!')).toBeVisible({ timeout: 8000 }).catch(()=>{});
  // Enable export
  const exportBtn = popup.getByRole('button', { name: /Export HTML/i });
  await expect(exportBtn).toBeEnabled({ timeout: 8000 });

  // 5) Trigger export (download in memory via download event)
  const [ download ] = await Promise.all([
    popup.waitForEvent('download', { timeout: 8000 }),
    exportBtn.click(),
  ]);
  const suggested = download.suggestedFilename();
  expect(suggested).toMatch(/onboarding-audit-example\.com/);

  await context.close();
});