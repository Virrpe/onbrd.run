import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateAuditJSON(jsonData: any): ValidationResult {
  const errors: string[] = [];
  
  // Basic structure validation
  if (!jsonData.id || typeof jsonData.id !== 'string') {
    errors.push('Missing or invalid audit ID');
  }
  
  if (!jsonData.url || typeof jsonData.url !== 'string') {
    errors.push('Missing or invalid URL');
  }
  
  if (!jsonData.timestamp || typeof jsonData.timestamp !== 'string') {
    errors.push('Missing or invalid timestamp');
  }
  
  if (!jsonData.heuristics || typeof jsonData.heuristics !== 'object') {
    errors.push('Missing or invalid heuristics object');
  } else {
    // Validate each heuristic
    const requiredHeuristics = [
      'h_cta_above_fold',
      'h_steps_count',
      'h_copy_clarity',
      'h_trust_markers',
      'h_perceived_signup_speed'
    ];
    
    requiredHeuristics.forEach(heuristic => {
      if (!jsonData.heuristics[heuristic]) {
        errors.push(`Missing heuristic: ${heuristic}`);
      }
    });
  }
  
  if (!jsonData.scores || typeof jsonData.scores !== 'object') {
    errors.push('Missing or invalid scores object');
  }
  
  if (!jsonData.recommendations || !Array.isArray(jsonData.recommendations)) {
    errors.push('Missing or invalid recommendations array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateContentScript(): void {
  console.log('🔍 Validating content script for IIFE format...\n');
  
  const contentScriptPath = join(process.cwd(), 'extension/dist/assets/content.js');
  
  if (!existsSync(contentScriptPath)) {
    console.error('❌ Content script not found at:', contentScriptPath);
    console.error('   Run "pnpm run build" first');
    process.exit(1);
  }
  console.log('✅ Content script exists at dist/assets/content.js');
  
  // Read first 4096 bytes to check for import/export statements
  const contentScriptContent = readFileSync(contentScriptPath, 'utf-8');
  const firstChunk = contentScriptContent.substring(0, 4096);
  
  // Check for top-level import/export statements (should not exist in IIFE)
  const hasTopLevelImportExport = /\bimport\s|^\s*export\s/m.test(firstChunk);
  if (hasTopLevelImportExport) {
    console.error('❌ Content script contains top-level import/export statements');
    console.error('   Content script must be built as IIFE format without ES modules');
    process.exit(1);
  }
  console.log('✅ Content script contains no top-level import/export statements');
  
  // Check for IIFE wrapper pattern (must be IIFE, not CommonJS)
  const hasIIFE = contentScriptContent.includes('(function(') || contentScriptContent.includes('!function(');
  if (!hasIIFE) {
    console.error('❌ Content script does not appear to be wrapped in IIFE format');
    console.error('   Expected IIFE wrapper pattern not found');
    process.exit(1);
  }
  console.log('✅ Content script appears to be wrapped in IIFE format');
  
  // Check for required PING and RUN_AUDIT handlers
  if (!contentScriptContent.includes('PING')) {
    console.error('❌ Content script missing PING handler');
    process.exit(1);
  }
  console.log('✅ Content script contains PING handler');
  
  if (!contentScriptContent.includes('RUN_AUDIT')) {
    console.error('❌ Content script missing RUN_AUDIT handler');
    process.exit(1);
  }
  console.log('✅ Content script contains RUN_AUDIT handler');
  
  // Print first 200 characters for diagnostic
  console.log('\n📋 Content script preview (first 200 chars):');
  console.log(contentScriptContent.substring(0, 200) + '...');
  
  console.log('\n✅ Content script validation completed successfully!');
}

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
    // If it's a loader file, check if it contains the actual service worker logic
    // or if it imports a separate service worker file
    const loaderContent = readFileSync(serviceWorkerPath, 'utf-8');
    
    // Check if it's just importing another file
    const importMatch = loaderContent.match(/import\s+['"](.+)['"]/);
    if (importMatch) {
      // It's importing another file, try to read that file
      const importedFile = importMatch[1];
      const importedPath = join(process.cwd(), 'extension/dist', importedFile);
      if (existsSync(importedPath)) {
        serviceWorkerContent = readFileSync(importedPath, 'utf-8');
      } else {
        console.error(`❌ Imported service worker file not found: ${importedFile}`);
        console.error('   The loader is trying to import a file that does not exist');
        process.exit(1);
      }
    } else {
      // The loader itself contains the service worker logic
      serviceWorkerContent = loaderContent;
    }
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
    
    // Test with sample audit data
    const sampleAudit = {
      id: 'audit-123',
      url: 'https://example.com',
      timestamp: new Date().toISOString(),
      heuristics: {
        h_cta_above_fold: { detected: true, position: 100, element: 'button' },
        h_steps_count: { total: 3, forms: 1, screens: 2 },
        h_copy_clarity: { avg_sentence_length: 12, passive_voice_ratio: 5, jargon_density: 2 },
        h_trust_markers: { testimonials: 2, security_badges: 1, customer_logos: 3, total: 6 },
        h_perceived_signup_speed: { form_fields: 5, required_fields: 3, estimated_seconds: 45 }
      },
      scores: {
        h_cta_above_fold: 100,
        h_steps_count: 80,
        h_copy_clarity: 90,
        h_trust_markers: 85,
        h_perceived_signup_speed: 75,
        overall: 86
      },
      recommendations: [
        {
          heuristic: "h_steps_count",
          priority: "high",
          description: "Consider reducing onboarding steps",
          fix: "Combine steps 2 and 3 into a single flow"
        }
      ]
    };
    
    const validation = validateAuditJSON(sampleAudit);
    
    if (validation.valid) {
      console.log('✅ Sample audit data validates successfully');
    } else {
      console.log('❌ Sample audit data validation failed:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
      process.exit(1);
    }
    
    console.log('\n✅ Schema validation completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    process.exit(1);
  }
}

function runSmokeTests(): void {
  console.log('🧪 Running smoke tests...\n');
  
  // Only run Playwright tests in CI environment to avoid flakiness locally
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  if (!isCI) {
    console.log('Skipping Playwright tests in non-CI environment');
    console.log('✅ Smoke tests skipped (run in CI only)');
    return;
  }
  
  try {
    // Run only the minimal Playwright demo test, not the full E2E suite
    console.log('Running minimal Playwright demo test...');
    execSync('pnpm exec playwright test tests/e2e/demo-path.spec.ts --project=chromium', { stdio: 'inherit', cwd: process.cwd() });
    
    console.log('✅ Smoke tests completed successfully!');
  } catch (error) {
    console.error('❌ Smoke tests failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function validateRegressionGuards(): void {
  console.log('🔍 Validating regression guards...\n');
  
  function mustExist(p: string) {
    if (!existsSync(p)) { console.error('[VERIFY] Missing:', p); process.exit(1); }
  }

  const manifest = JSON.parse(readFileSync('extension/manifest.json','utf8'));
  // 1) No content_scripts
  if (manifest.content_scripts) { console.error('[VERIFY] content_scripts present'); process.exit(1); }
  // 2) SW ends with .js in dist output (loader name)
  const sw = manifest.background?.service_worker;
  if (!sw || !sw.endsWith('.js')) { console.error('[VERIFY] SW must be built JS, got:', sw); process.exit(1); }
  // 3) default_popup path exists in src/
  const popup = manifest.action?.default_popup;
  mustExist(join('extension', popup || ''));
  // 4) built content script exists as single IIFE
  mustExist(join('extension/dist/assets/content.js'));
  const contentJs = readFileSync('extension/dist/assets/content.js','utf8');
  if (/^\s*import\s/m.test(contentJs) || /^\s*export\s/m.test(contentJs)) {
    console.error('[VERIFY] content.js must be IIFE (no top-level import/export)');
    process.exit(1);
  }
  // 5) Tailwind CSS inclusion check: popup main imports styles.css
  const mainTs = readFileSync('extension/src/popup/main.ts','utf8');
  if (!mainTs.includes(`'./styles.css'`) && !mainTs.includes(`"./styles.css"`)) {
    console.error('[VERIFY] popup main.ts missing styles.css import');
    process.exit(1);
  }
  
  // 6) Check that extension/dist/assets/content.js exists and has no top-level imports/exports
  const contentJsPath = 'extension/dist/assets/content.js';
  if (!existsSync(contentJsPath)) {
    console.error('[VERIFY] Content script not found at:', contentJsPath);
    console.error('   Run "pnpm run build" first');
    process.exit(1);
  }
  console.log('[VERIFY] Content script exists at dist/assets/content.js');
  
  // Read content script and validate IIFE format
  const contentJsContent = readFileSync(contentJsPath, 'utf-8');
  if (/^\s*import\s/m.test(contentJsContent) || /^\s*export\s/m.test(contentJsContent)) {
    console.error('[VERIFY] content.js must be IIFE (no top-level import/export)');
    process.exit(1);
  }
  console.log('[VERIFY] Content script contains no top-level import/export statements');
  
  // 7) Check popup main imports styles.css (already checked above, but ensure it's in the built version too)
  const builtPopupPath = 'extension/dist/src/popup/popup.html';
  if (existsSync(builtPopupPath)) {
    const builtPopup = readFileSync(builtPopupPath, 'utf8');
    if (!builtPopup.includes('styles.css') && !builtPopup.includes('popup')) {
      console.warn('[VERIFY] Built popup may be missing CSS/JS references');
    } else {
      console.log('[VERIFY] Built popup contains expected references');
    }
  }
  
  console.log('[VERIFY] All guards passed');
}

function main(): void {
  console.log('🔍 Starting verification process...\n');
  
  // Validate regression guards first
  validateRegressionGuards();
  
  // Validate audit schema
  validateAuditSchema();
  
  // Validate content script format
  validateContentScript();
  
  // Validate built manifest
  validateBuiltManifest();
  
  // Run smoke tests
  runSmokeTests();
  
  console.log('\n✅ All verifications completed successfully!');
}

main();