import { build } from 'vite'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Build content script separately with IIFE format
async function buildContentScript() {
  try {
    await build({
      root: __dirname,
      plugins: [], // No plugins to avoid CRX interference
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            content: 'src/content/entry.ts'
          },
          output: {
            format: 'cjs',
            inlineDynamicImports: false,
            entryFileNames: 'assets/content.js'
          }
        }
      }
    })
    console.log('Content script built successfully with IIFE format!')
  } catch (error) {
    console.error('Error building content script:', error)
    process.exit(1)
  }
}

buildContentScript()