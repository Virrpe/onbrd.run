import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  root: __dirname,
  plugins: [
    svelte({
      preprocess: {
        script: ({ content, attributes }) => {
          if (attributes.lang === 'ts') {
            // TypeScript preprocessing is handled by Vite's built-in TypeScript support
            return { code: content }
          }
          return { code: content }
        }
      }
    }),
    crx({
      manifest,
      contentScripts: {
        injectCss: true,
        // Don't let CRX plugin handle the service worker or content script - we'll do it manually
        preambleCode: false
      }
    })
  ],
  resolve: {
    alias: {
      '@core': resolve(__dirname, '../packages/core/src'),
      '@report': resolve(__dirname, '../packages/report/src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'service-worker': 'src/background/index.ts',
        popup: 'src/popup/main.ts'
        // content script is built separately
      },
      output: {
        format: 'es',
        inlineDynamicImports: false,
        entryFileNames: (chunk) => {
          // Map the background script to service-worker.js
          if (chunk.name === 'service-worker') return 'service-worker.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})