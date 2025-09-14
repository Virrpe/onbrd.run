import { test, expect, chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { join } from 'path';

test.describe('OnboardingAudit.ai Extension Smoke Tests', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let extensionId: string;

  test.beforeAll(async () => {
    // Build extension path
    const extensionPath = join(__dirname, '../../extension/dist');
    
    // Launch browser with extension
    browser = await chromium.launch({
      headless: false, // Extensions don't work in headless mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    // Get extension ID by navigating to chrome://extensions
    context = await browser.newContext();
    const backgroundPage = await context.newPage();
    await backgroundPage.goto('chrome://extensions/');
    
    // Wait for extensions to load and get the extension ID
    await backgroundPage.waitForTimeout(2000);
    
    // Get extension ID from the page (this is a bit hacky but works)
    const extensions = await backgroundPage.evaluate(() => {
      const extensionsList = document.querySelector('extensions-manager');
      if (extensionsList && extensionsList.shadowRoot) {
        const items = extensionsList.shadowRoot.querySelectorAll('extensions-item');
        for (const item of items) {
          const name = item.shadowRoot?.querySelector('#name')?.textContent;
          if (name?.includes('OnboardingAudit')) {
            return item.id;
          }
        }
      }
      return null;
    });

    extensionId = extensions || 'unknown';
    console.log('Extension ID:', extensionId);
    
    await backgroundPage.close();
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

  test('extension popup loads and shows correct UI', async () => {
    // Navigate to extension popup
    await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
    
    // Check that popup content loads
    await expect(page.locator('text=OnboardingAudit.ai')).toBeVisible();
    await expect(page.locator('button:has-text("Run Audit")')).toBeVisible();
    await expect(page.locator('button:has-text("Export JSON")')).toBeVisible();
    await expect(page.locator('button:has-text("Export HTML")')).toBeVisible();
  });

  async function testWebsiteAudit(url: string, siteName: string) {
    test(`audit ${siteName} - ${url}`, async () => {
      // Navigate to the website
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait a bit for any dynamic content
      await page.waitForTimeout(2000);
      
      // Open extension popup in a new tab
      const popupPage = await context.newPage();
      await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
      
      // Click run audit button
      const runAuditButton = popupPage.locator('button:has-text("Run Audit")');
      await runAuditButton.click();
      
      // Wait for audit to complete (max 30 seconds)
      await expect(popupPage.locator('text=Audit complete!')).toBeVisible({ timeout: 30000 });
      
      // Get the audit result from the popup
      const auditData = await popupPage.evaluate(() => {
        // Access the lastAudit data from the popup's window
        return (window as any).lastAudit;
      });
      
      // Validate audit data structure
      expect(auditData).toBeDefined();
      expect(auditData.url).toBe(url);
      expect(auditData.timestamp).toBeDefined();
      expect(auditData.id).toBeDefined();
      
      // Validate scores
      expect(auditData.scores).toBeDefined();
      expect(auditData.scores.overall).toBeGreaterThanOrEqual(0);
      expect(auditData.scores.overall).toBeLessThanOrEqual(100);
      
      // Validate heuristics (all 5 must be present)
      expect(auditData.heuristics).toBeDefined();
      expect(auditData.heuristics.h_cta_above_fold).toBeDefined();
      expect(auditData.heuristics.h_steps_count).toBeDefined();
      expect(auditData.heuristics.h_copy_clarity).toBeDefined();
      expect(auditData.heuristics.h_trust_markers).toBeDefined();
      expect(auditData.heuristics.h_perceived_signup_speed).toBeDefined();
      
      // Validate recommendations (must have at least 1 issue)
      expect(auditData.recommendations).toBeDefined();
      expect(auditData.recommendations.length).toBeGreaterThanOrEqual(1);
      
      // Test HTML export functionality
      const exportHTMLButton = popupPage.locator('button:has-text("Export HTML")');
      await exportHTMLButton.click();
      
      // Wait for export success message
      await expect(popupPage.locator('text=HTML report exported successfully')).toBeVisible();
      
      await popupPage.close();
      
      // Save audit data for artifacts
      return auditData;
    });
  }

  // Test the three specified websites
  testWebsiteAudit('https://linear.app', 'Linear');
  testWebsiteAudit('https://calendly.com', 'Calendly');
  testWebsiteAudit('https://notion.so', 'Notion');

  test('export functionality works correctly', async () => {
    // Navigate to a simple test page
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    
    // Open extension popup
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
    
    // Run audit
    const runAuditButton = popupPage.locator('button:has-text("Run Audit")');
    await runAuditButton.click();
    
    // Wait for audit to complete
    await expect(popupPage.locator('text=Audit complete!')).toBeVisible({ timeout: 30000 });
    
    // Test JSON export
    const exportJSONButton = popupPage.locator('button:has-text("Export JSON")');
    await exportJSONButton.click();
    
    // Wait for export success
    await expect(popupPage.locator('text=Audit exported successfully')).toBeVisible();
    
    // Test HTML export
    const exportHTMLButton = popupPage.locator('button:has-text("Export HTML")');
    await exportHTMLButton.click();
    
    // Wait for export success
    await expect(popupPage.locator('text=HTML report exported successfully')).toBeVisible();
    
    await popupPage.close();
  });

  test('audit data validation', async () => {
    // Navigate to a test page
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    
    // Open extension popup
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
    
    // Run audit
    const runAuditButton = popupPage.locator('button:has-text("Run Audit")');
    await runAuditButton.click();
    
    // Wait for audit to complete
    await expect(popupPage.locator('text=Audit complete!')).toBeVisible({ timeout: 30000 });
    
    // Get audit data
    const auditData = await popupPage.evaluate(() => {
      return (window as any).lastAudit;
    });
    
    // Validate required fields
    expect(auditData.scores.overall).toBeGreaterThanOrEqual(0);
    expect(auditData.scores.overall).toBeLessThanOrEqual(100);
    expect(auditData.recommendations.length).toBeGreaterThanOrEqual(1);
    
    // Validate all heuristic scores are in range [0,100]
    Object.values(auditData.scores).forEach((score) => {
      if (typeof score === 'number') {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
    
    await popupPage.close();
  });
});