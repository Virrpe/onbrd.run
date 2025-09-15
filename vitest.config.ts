import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: [
      'tests/e2e/**',
      'tests/puppeteer/**',
      'tests/hello.spec.ts',
      'node_modules/**',
      'dist/**',
      'backend/**',
      '**/node_modules/**'
    ],
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'extension/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ]
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'packages/core/src'),
      '@report': resolve(__dirname, 'packages/report/src')
    }
  }
});