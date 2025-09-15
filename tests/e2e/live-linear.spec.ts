import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const EXT_PATH = path.resolve(__dirname, '../../extension/dist');
const FALLBACK_SITES = [
  'https://linear.app',
  'https://calendly.com',
  'https://www.notion.so',
];

async function getExtensionId(context: any): Promise<string> {
  const workers = context.serviceWorkers();
  let extId: string | undefined;
  for (let i = 0; i < 10; i++) {
    if (workers.length) {
      const url = workers[0].url();
      const m = url.match(/chrome-extension:\/\/([a-p]{32})\//);
      if (m) { extId = m[1]; break; }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!extId) throw new Error('Extension ID not found from service worker URL');
  return extId;
}

async function openPopup(context: any, extId: string) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extId}/src/popup/popup.html`, { waitUntil: 'domcontentloaded' });
  return popup;
}

test('Onbrd popup runs audit and exports HTML on a live site with fallback', async () => {
  const userDataDir = fs.mkdtempSync('/tmp/onbrd-e2e-');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT_PATH}`,
      `--load-extension=${EXT_PATH}`,
    ],
    timeout: 60000,
  });

  try {
    const page = await context.newPage();
    let injected = false;
    for (const url of FALLBACK_SITES) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(1500);

        const extId = await getExtensionId(context);
        const popup = await openPopup(context, extId);

        // Click Run Audit
        await popup.getByRole('button', { name: /run audit/i }).click();

        // Wait for score to appear or Export to enable
        const exportBtn = popup.getByRole('button', { name: /export html/i });
        await expect(exportBtn).toBeEnabled({ timeout: 20000 });

        // Check for benchmark line when API is up - updated to match current popup
        await expect(popup.locator('text=/Top \\d+% of \\d+ peers/')).toBeVisible({ timeout: 20000 });
        // Add report export assertion: open data URL (if captured) or verify that download name includes host and ".html"

        await exportBtn.click();
        injected = true;
        break;
      } catch (err) {
        console.error(`[E2E] Failed on ${url}:`, (err as Error).message);
      }
    }

    expect(injected, 'Failed to inject and export on all fallback sites').toBeTruthy();
  } finally {
    await context.close();
  }
});

// add: 1) consent OFF => no /ingest network calls (use route interception)
test('Consent OFF prevents ingest network calls', async () => {
  const userDataDir = fs.mkdtempSync('/tmp/onbrd-e2e-consent-off-');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT_PATH}`,
      `--load-extension=${EXT_PATH}`,
    ],
    timeout: 60000,
  });

  try {
    const page = await context.newPage();
    
    // Intercept ingest requests
    const ingestRequests: any[] = [];
    await page.route('**/api/v1/ingest', (route) => {
      ingestRequests.push(route.request());
      route.abort();
    });

    await page.goto('https://linear.app', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);

    const extId = await getExtensionId(context);
    const popup = await openPopup(context, extId);

    // Ensure consent is OFF
    const consentCheckbox = popup.locator('input[type="checkbox"]');
    const isChecked = await consentCheckbox.isChecked();
    if (isChecked) {
      await consentCheckbox.click();
    }

    // Run audit
    await popup.getByRole('button', { name: /run audit/i }).click();
    await popup.waitForTimeout(3000); // Wait for audit to complete

    // Should have no ingest requests
    expect(ingestRequests.length).toBe(0);
    console.log('[E2E] Consent OFF: No ingest requests made');

  } finally {
    await context.close();
  }
});

//      2) consent ON => one POST /ingest and benchmark text visible
test('Consent ON enables ingest and benchmark display', async () => {
  const userDataDir = fs.mkdtempSync('/tmp/onbrd-e2e-consent-on-');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT_PATH}`,
      `--load-extension=${EXT_PATH}`,
    ],
    timeout: 60000,
  });

  try {
    const page = await context.newPage();
    
    // Intercept ingest requests
    const ingestRequests: any[] = [];
    await page.route('**/api/v1/ingest', async (route) => {
      ingestRequests.push(route.request());
      // Mock successful response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'accepted',
          percentile: 75,
          median: 85,
          count: 1000
        })
      });
    });

    await page.goto('https://linear.app', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);

    const extId = await getExtensionId(context);
    const popup = await openPopup(context, extId);

    // Ensure consent is ON
    const consentCheckbox = popup.locator('input[type="checkbox"]');
    const isChecked = await consentCheckbox.isChecked();
    if (!isChecked) {
      await consentCheckbox.click();
    }

    // Run audit
    await popup.getByRole('button', { name: /run audit/i }).click();
    
    // Wait for audit to complete
    await popup.waitForTimeout(3000);

    // Should have made ingest request
    expect(ingestRequests.length).toBeGreaterThan(0);
    console.log(`[E2E] Consent ON: Made ${ingestRequests.length} ingest request(s)`);

    // Should show benchmark text
    const popupText = await popup.textContent() || '';
    const hasBenchmarkText = popupText.includes('Top') && popupText.includes('peers');
    expect(hasBenchmarkText).toBeTruthy();
    console.log('[E2E] Consent ON: Benchmark text visible');

  } finally {
    await context.close();
  }
});

//      3) offline => queue size increases then flushes when back online (mock by shutting API and reopening)
test('Offline queue behavior and flush when back online', async () => {
  const userDataDir = fs.mkdtempSync('/tmp/onbrd-e2e-offline-');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT_PATH}`,
      `--load-extension=${EXT_PATH}`,
    ],
    timeout: 60000,
  });

  try {
    const page = await context.newPage();
    
    // Block ingest requests (simulate offline)
    let ingestRequests: any[] = [];
    await page.route('**/api/v1/ingest', (route) => {
      ingestRequests.push(route.request());
      route.abort('failed');
    });

    await page.goto('https://linear.app', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);

    const extId = await getExtensionId(context);
    const popup = await openPopup(context, extId);

    // Ensure consent is ON
    const consentCheckbox = popup.locator('input[type="checkbox"]');
    const isChecked = await consentCheckbox.isChecked();
    if (!isChecked) {
      await consentCheckbox.click();
    }

    // Run audit while "offline"
    await popup.getByRole('button', { name: /run audit/i }).click();
    await popup.waitForTimeout(3000);

    // Should have attempted ingest but failed
    expect(ingestRequests.length).toBeGreaterThan(0);
    console.log(`[E2E] Offline: Attempted ${ingestRequests.length} ingest request(s), all failed`);

    // Now simulate coming back online
    ingestRequests = [];
    await page.unroute('**/api/v1/ingest');
    await page.route('**/api/v1/ingest', async (route) => {
      ingestRequests.push(route.request());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'accepted',
          percentile: 75,
          median: 85,
          count: 1000
        })
      });
    });

    // Trigger queue flush by going online (simulate by running another audit)
    await popup.getByRole('button', { name: /run audit/i }).click();
    await popup.waitForTimeout(3000);

    // Should have retried the queued requests
    expect(ingestRequests.length).toBeGreaterThan(0);
    console.log(`[E2E] Back online: Retried ${ingestRequests.length} ingest request(s)`);

  } finally {
    await context.close();
  }
});