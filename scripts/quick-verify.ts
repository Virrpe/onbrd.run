import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function validateBuiltManifest(): void {
  console.log('🔍 Validating built manifest for programmatic injection compliance...\n');
  
  const builtManifestPath = join(process.cwd(), 'extension/dist/manifest.json');
  
  if (!existsSync(builtManifestPath)) {
    console.error('❌ Built manifest not found at:', builtManifestPath);
    console.error('   Run "pnpm run build" first');
    process.exit(1);
  }
  
  const manifestContent = readFileSync(builtManifestPath, 'utf-8');
  const manifest = JSON.parse(manifestContent);
  
  // Check service_worker configuration - must be present
  if (!manifest.background || !manifest.background.service_worker) {
    console.error('❌ Built manifest missing background.service_worker');
    process.exit(1);
  }
  
  // Accept either service-worker.js or service-worker-loader.js (CRX plugin generates loader)
  const validServiceWorkers = ['service-worker.js', 'service-worker-loader.js'];
  if (!validServiceWorkers.includes(manifest.background.service_worker)) {
    console.error('❌ Built manifest service_worker must be either "service-worker.js" or "service-worker-loader.js"');
    console.error(`   Found: ${manifest.background.service_worker}`);
    process.exit(1);
  }
  
  // Check that service worker file exists - must be service-worker.js
  const serviceWorkerFile = manifest.background.service_worker;
  const serviceWorkerPath = join(process.cwd(), 'extension/dist', serviceWorkerFile);
  if (!existsSync(serviceWorkerPath)) {
    console.error('❌ Service worker file not found at:', serviceWorkerPath);
    process.exit(1);
  }
  
  // For the actual service worker content checks, we need to read the real service worker file
  // not the loader file that the CRX plugin might generate
  let serviceWorkerContent: string;
  if (serviceWorkerFile === 'service-worker-loader.js') {
    // If it's a loader file, read the actual service-worker.js file
    const actualServiceWorkerPath = join(process.cwd(), 'extension/dist/service-worker.js');
    if (!existsSync(actualServiceWorkerPath)) {
      console.error('❌ Actual service worker file not found at:', actualServiceWorkerPath);
      process.exit(1);
    }
    serviceWorkerContent = readFileSync(actualServiceWorkerPath, 'utf-8');
  } else {
    serviceWorkerContent = readFileSync(serviceWorkerPath, 'utf-8');
  }
  
  // Check that service worker contains required message listener
  if (!serviceWorkerContent.includes('chrome.runtime.onMessage.addListener')) {
    console.error('❌ Service worker missing chrome.runtime.onMessage.addListener');
    console.error('   Service worker must contain message handling for extension communication');
    process.exit(1);
  }
  console.log('✅ Service worker contains chrome.runtime.onMessage.addListener');
  
  // Check that service worker does not contain forbidden API calls
  if (serviceWorkerContent.includes('chrome.contextMenus')) {
    console.error('❌ Service worker contains chrome.contextMenus references');
    console.error('   Remove all chrome.contextMenus.create and chrome.contextMenus.onClicked calls');
    process.exit(1);
  }
  console.log('✅ Service worker does not contain chrome.contextMenus');
  
  if (serviceWorkerContent.includes('chrome.action.onClicked')) {
    console.error('❌ Service worker contains chrome.action.onClicked references');
    console.error('   Remove chrome.action.onClicked.addListener calls');
    process.exit(1);
  }
  console.log('✅ Service worker does not contain action.onClicked');
  
  // Check for content_scripts block (should be removed for programmatic injection)
  if (manifest.content_scripts) {
    console.error('❌ Built manifest still contains content_scripts block:');
    console.error('  - Programmatic injection requires removing content_scripts from manifest');
    process.exit(1);
  }
  
  // Check for .ts references in any field (case-insensitive)
  const manifestString = JSON.stringify(manifest).toLowerCase();
  if (manifestString.includes('.ts')) {
    console.error('❌ Built manifest contains .ts references:');
    
    // Find specific fields with .ts
    const findTsReferences = (obj: any, path = ''): string[] => {
      const issues: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'string' && value.toLowerCase().includes('.ts')) {
          issues.push(`  - ${currentPath}: ${value}`);
        } else if (typeof value === 'object' && value !== null) {
          issues.push(...findTsReferences(value, currentPath));
        }
      }
      return issues;
    };
    
    findTsReferences(manifest).forEach(issue => console.error(issue));
    process.exit(1);
  }
  
  // WARN if host_permissions appear (we want them gone for MVP)
  if (manifest.host_permissions && manifest.host_permissions.length > 0) {
    console.warn('⚠️  Built manifest contains host_permissions (should be removed for MVP):');
    console.warn(`   ${JSON.stringify(manifest.host_permissions)}`);
  }
  
  console.log('✅ Built manifest contains no content_scripts block and no .ts references');
  console.log(`✅ Service worker configured correctly: ${manifest.background.service_worker}`);
  console.log(`✅ Service worker file exists at dist/${manifest.background.service_worker}`);
  console.log('✅ Programmatic injection configuration validated');
}

function validateAuditSchema(): void {
  console.log('🔍 Validating audit_v1.json schema...\n');
  
  try {
    // Validate the schema file itself exists
    const schemaPath = join(process.cwd(), 'packages/core/schemas/audit_v1.json');
    console.log(`Checking schema file: ${schemaPath}`);
    
    if (!existsSync(schemaPath)) {
      console.error('❌ Schema file not found');
      process.exit(1);
    }
    
    console.log('✅ Schema file exists');
    
    // Load and validate the schema
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    
    console.log('✅ Schema JSON is valid');
    console.log(`📋 Schema version: ${schema.$schema || 'unknown'}`);
    console.log(`🎯 Schema title: ${schema.title || 'unknown'}`);
    
    console.log('\n✅ Schema validation completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    process.exit(1);
  }
}

function main(): void {
  console.log('🔍 Starting quick verification process...\n');
  
  // Validate audit schema
  validateAuditSchema();
  
  // Validate built manifest
  validateBuiltManifest();
  
  console.log('\n✅ Quick verification completed successfully!');
  console.log('✅ Extension built correctly and ready for manual testing');
  console.log('⚠️  Note: Smoke tests require manual browser testing due to Playwright limitations');
}

main();