import { build } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildExtension() {
  try {
    console.log('[OA] Building service worker with IIFE format...')
    
    // Build service worker with IIFE format (separately to avoid import statements)
    await build({
      root: __dirname,
      plugins: [], // No CRX plugin to avoid conflicts
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            'service-worker': 'src/background/index.ts'
          },
          output: {
            format: 'cjs',
            entryFileNames: 'service-worker.js'
          }
        }
      }
    })
    
    console.log('[OA] Building popup...')
    
    // Build popup separately
    await build({
      root: __dirname,
      plugins: [], // No CRX plugin to avoid conflicts
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            popup: 'src/popup/main.ts'
          },
          output: {
            format: 'es',
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]'
          }
        }
      }
    })
    
    console.log('[OA] Service worker and popup built successfully!')
    
    // Ensure the assets directory exists
    const assetsDir = join(__dirname, 'dist', 'assets')
    if (!existsSync(assetsDir)) {
      mkdirSync(assetsDir, { recursive: true })
    }
    
    console.log('[OA] Extension built successfully!')
    
  } catch (error) {
    console.error('Error building extension:', error)
    process.exit(1)
  }
}

buildExtension()