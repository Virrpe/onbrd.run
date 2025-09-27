import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import preprocess from 'svelte-preprocess'
import { readFileSync } from 'fs'

// Read build metadata
function getBuildMetadata() {
  try {
    const rulesetHash = readFileSync(resolve(__dirname, 'src/scoring/weights.hash'), 'utf8').trim()
    return {
      rulesetHash,
      rulesetVersion: '1.1.0',
      buildId: `build-${Date.now()}`,
      mode: 'local' as const
    }
  } catch (error) {
    // Fallback values if weights.hash doesn't exist
    return {
      rulesetHash: 'unknown',
      rulesetVersion: '1.1.0',
      buildId: `dev-${Date.now()}`,
      mode: 'local' as const
    }
  }
}

const buildMetadata = getBuildMetadata()

export default defineConfig(({ mode }) => ({
  root: __dirname,
  plugins: [
    svelte({
      preprocess: preprocess({
        typescript: true
      }),
      compilerOptions: {
        dev: mode !== 'production'
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
        popup: resolve(__dirname, 'src/popup/main.ts')
        // content script is built separately in vite.content.config.ts
        // service worker is handled by CRXJS via manifest
      },
      output: {
        format: 'es',
        inlineDynamicImports: false,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    // Prevent font inlining - keep fonts as separate files
    assetsInlineLimit: 0
  },
  define: {
    'import.meta.env.VITE_DEBUG_LOGS': JSON.stringify(mode !== 'production'),
    'BUILD_ID': JSON.stringify(buildMetadata.buildId),
    'MODE': JSON.stringify(buildMetadata.mode),
    'RULESET_HASH': JSON.stringify(buildMetadata.rulesetHash),
    'RULESET_VERSION': JSON.stringify(buildMetadata.rulesetVersion),
  },
}))