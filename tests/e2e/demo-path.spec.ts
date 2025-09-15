import { test, expect, chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { join } from 'path';
import { createHash } from 'crypto';

test.describe('OnboardingAudit.ai Demo Path', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let extensionId: string;

  test.beforeAll(async () => {
    // Build extension path
    const extensionPath = join(__dirname, '../../extension/dist');
    const absoluteExtensionPath = join(process.cwd(), 'extension/dist');
    
    // Calculate extension ID based on absolute path (Chrome's algorithm for unpacked extensions)
    const hash = createHash('sha256');
    hash.update(absoluteExtensionPath);
    const digest = hash.digest();
    let calculatedId = '';
    for (let i = 0; i < 16; i++) {
      calculatedId += String.fromCharCode(97 + (digest[i] % 16)); // 'a' to 'p'
    }
    extensionId = calculatedId;
    console.log('Calculated extension ID:', extensionId);
    
    // Launch browser with extension
    browser = await chromium.launch({
      headless: true, // Use headless for CI
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    // Create a context and wait for extension to load
    context = await browser.newContext();
    
    // Wait for extension to load
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test.beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
    if (context) {
      await context.close();
    }
  });

  test('demo path - popup loads and shows UI', async () => {
    // Navigate to extension popup
    await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
    
    // Check that popup content loads
    await expect(page.locator('text=Onbrd')).toBeVisible();
    await expect(page.locator('button:has-text("Run Audit")')).toBeVisible();
    await expect(page.locator('button:has-text("Export HTML")')).toBeVisible();
    
    // Check that score is visible
    const scoreElement = page.locator('text=/\\d+/').first();
    await expect(scoreElement).toBeVisible();
    
    // Get the score value
    const scoreText = await scoreElement.textContent();
    const score = parseInt(scoreText || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    
    console.log(`✅ Demo path: Popup loads with score ${score}`);
  });

  test('demo path - run audit button works', async () => {
    // Navigate to extension popup
    await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
    
    // Click run audit button
    const runAuditButton = page.locator('button:has-text("Run Audit")');
    await expect(runAuditButton).toBeVisible();
    await expect(runAuditButton).not.toBeDisabled();
    
    // Click the button
    await runAuditButton.click();
    
    // Wait a moment for any potential action
    await page.waitForTimeout(1000);
    
    console.log('✅ Demo path: Run Audit button clicked successfully');
  });

  test('demo path - export button state', async () => {
    // Navigate to extension popup
    await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
    
    // Check export button state
    const exportButton = page.locator('button:has-text("Export HTML")');
    await expect(exportButton).toBeVisible();
    
    // The export button should be disabled initially (no audit run yet)
    await expect(exportButton).toBeDisabled();
    
    console.log('✅ Demo path: Export button state verified');
  });

  test('demo path - popup styling with Tailwind', async () => {
    // Navigate to extension popup
    await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
    
    // Check for Tailwind CSS classes
    const popupContainer = page.locator('.p-4'); // padding class from Tailwind
    await expect(popupContainer).toBeVisible();
    
    // Check for other Tailwind classes
    const spaceYElements = page.locator('.space-y-3');
    await expect(spaceYElements.first()).toBeVisible();
    
    // Check that text has proper styling
    const titleElement = page.locator('text=Onbrd');
    await expect(titleElement).toBeVisible();
    
    // Verify the popup has proper visual hierarchy
    const buttons = page.locator('button');
    await expect(buttons.first()).toBeVisible();
    
    console.log('✅ Demo path: Tailwind styling verified');
  });

  test('demo path - critical UI elements present', async () => {
    // Navigate to extension popup
    await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
    
    // Check for critical UI elements
    const criticalElements = [
      'text=Onbrd',
      'button:has-text("Run Audit")',
      'button:has-text("Export HTML")',
      'text=/benchmark offline/i',
      'text=/Fix these to improve:/i'
    ];
    
    for (const selector of criticalElements) {
      const element = page.locator(selector);
      await expect(element.first()).toBeVisible();
    }
    
    console.log('✅ Demo path: All critical UI elements present');
  });
});