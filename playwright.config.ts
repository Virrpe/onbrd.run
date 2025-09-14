import { defineConfig, devices } from '@playwright/test';
import { join } from 'path';

// Get extension path for loading in tests
const extensionPath = join(__dirname, 'extension/dist');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load extension for Chrome
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Don't start dev server - use pre-built extension
  // webServer: {
  //   command: 'pnpm dev',
  //   port: 5173,
  //   reuseExistingServer: !process.env.CI,
  // },
});