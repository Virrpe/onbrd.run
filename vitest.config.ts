import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'packages/core/src'),
      '@report': resolve(__dirname, 'packages/report/src')
    }
  }
});