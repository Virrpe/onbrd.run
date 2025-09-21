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
      '**/node_modules/**'
    ],
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'extension/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'backend/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    coverage: {
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/mockData.ts',
        'coverage/**',
        'dist/**',
        'site/**',
        'artifacts/**',
        'scripts/**',
        'tmp/**',
        '**/*.cjs',
        '**/*.svelte',
        'extension/public/**',
        'extension/build-*.js',
        'extension/service-worker-loader.js'
      ],
      // Global gates modest; strict targets enforced via scripts/check-coverage.mjs
      thresholds: {
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1
      }
    }
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'packages/core/src'),
      '@report': resolve(__dirname, 'packages/report/src')
    }
  }
});