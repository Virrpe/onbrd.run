import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: __dirname,
  build: {
    outDir: 'dist',
    emptyOutDir: false,   // DON'T wipe dist; CRX build runs first
    lib: {
      entry: resolve(__dirname, 'src/content/entry.ts'),
      name: 'OAContent',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/content.js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        inlineDynamicImports: true
      }
    }
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, '../packages/core/src'),
      '@report': resolve(__dirname, '../packages/report/src')
    }
  }
})