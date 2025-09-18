import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  timeout: 60000,
  retries: 0,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: false, // Will be overridden by CI=true
        launchOptions: {
          args: [
            '--disable-extensions-except=./extension/dist',
            '--load-extension=./extension/dist',
            '--disable-web-security',
            '--allow-running-insecure-content',
          ],
        }
      }
    },
  ],
});
