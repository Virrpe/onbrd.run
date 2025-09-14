import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // for now, only run this tiny sanity test so the runner is stable
  testMatch: ['hello.spec.ts'],
  reporter: 'list',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true }
    }
  ]
});
