import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'packages/core/src'),
      '@report': resolve(__dirname, 'packages/report/src')
    }
  },
  build: {
    target: 'chrome88',
    lib: {
      entry: resolve(__dirname, 'packages/core/src/index.ts'),
      name: 'OnboardingAuditCore',
      fileName: 'onboarding-audit-core'
    },
    rollupOptions: {
      external: ['chrome'],
      output: {
        globals: {
          chrome: 'chrome'
        }
      }
    }
  }
});