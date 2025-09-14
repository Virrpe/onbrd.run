import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  timeout: 60000,
  retries: 0,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], headless: false } },
  ],
});
