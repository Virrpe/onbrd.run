#!/usr/bin/env node

/**
 * Network Path Verification Script
 * 
 * This script analyzes the extension source code to verify that all network
 * calls go through the guardedFetch and guardedWebSocket functions.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const EXTENSION_SRC_DIR = 'extension/src';
const NETWORK_GUARD_FILE = 'extension/src/net/guard.ts';

// Network-related patterns to search for
const NETWORK_PATTERNS = [
  { pattern: /\bfetch\s*\(/, type: 'fetch', description: 'Direct fetch calls' },
  { pattern: /\bnew\s+WebSocket\s*\(/, type: 'websocket', description: 'Direct WebSocket constructors' },
  { pattern: /\bXMLHttpRequest\s*\(/, type: 'xhr', description: 'XMLHttpRequest usage' }
];

// Allowed network patterns (these should be the only ones present)
const ALLOWED_PATTERNS = [
  { pattern: /\bguardedFetch\s*\(/, type: 'guarded', description: 'Guarded fetch calls' },
  { pattern: /\bguardedWebSocket\s*\(/, type: 'guarded', description: 'Guarded WebSocket calls' }
];

/**
 * Recursively find all TypeScript files in a directory
 */
function findTypeScriptFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findTypeScriptFiles(fullPath, files);
    } else if (extname(fullPath) === '.ts') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analyze a file for network usage patterns
 */
function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const results = {
    file: filePath,
    networkCalls: [],
    guardedCalls: [],
    violations: []
  };

  // Check for direct network calls (violations)
  NETWORK_PATTERNS.forEach(({ pattern, type, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      // Skip the guard module itself - it contains the implementation
      if (filePath.includes('guard.ts') && (type === 'fetch' || type === 'websocket')) {
        return;
      }
      
      results.violations.push({
        type,
        description,
        count: matches.length,
        lines: content.split('\n').filter((line, _index) => {
          return pattern.test(line) && !line.includes('guarded') && !line.includes('// skip');
        }).map((line, index) => ({
          lineNumber: index + 1,
          content: line.trim()
        }))
      });
    }
  });

  // Check for allowed guarded calls
  ALLOWED_PATTERNS.forEach(({ pattern, type, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      results.guardedCalls.push({
        type,
        description,
        count: matches.length
      });
    }
  });

  return results;
}

/**
 * Main analysis function
 */
function analyzeNetworkPaths() {
  console.log('🔍 Analyzing network paths in extension source code...\n');

  // First, verify that the guard file exists
  try {
    const guardContent = readFileSync(NETWORK_GUARD_FILE, 'utf-8');
    console.log('✅ Network guard module found');
    
    // Check if guard functions are properly defined
    if (!guardContent.includes('guardedFetch')) {
      console.log('❌ guardedFetch function not found in guard module');
      return;
    }
    if (!guardContent.includes('guardedWebSocket')) {
      console.log('❌ guardedWebSocket function not found in guard module');
      return;
    }
    if (!guardContent.includes('NetworkDisabledError')) {
      console.log('❌ NetworkDisabledError class not found in guard module');
      return;
    }
    console.log('✅ Guard functions properly defined');
  } catch (error) {
    console.log('❌ Network guard module not found');
    return;
  }

  console.log('');

  // Find all TypeScript files in the extension source
  const tsFiles = findTypeScriptFiles(EXTENSION_SRC_DIR);
  console.log(`📁 Found ${tsFiles.length} TypeScript files to analyze\n`);

  let totalViolations = 0;
  let totalGuardedCalls = 0;
  const violationsByFile = [];

  // Analyze each file
  tsFiles.forEach(filePath => {
    const analysis = analyzeFile(filePath);
    
    if (analysis.violations.length > 0) {
      violationsByFile.push(analysis);
      totalViolations += analysis.violations.reduce((sum, v) => sum + v.count, 0);
    }
    
    totalGuardedCalls += analysis.guardedCalls.reduce((sum, g) => sum + g.count, 0);
  });

  // Report results
  console.log('📊 ANALYSIS RESULTS');
  console.log('==================');
  console.log(`Total files analyzed: ${tsFiles.length}`);
  console.log(`Guarded network calls found: ${totalGuardedCalls}`);
  console.log(`Direct network violations: ${totalViolations}`);
  console.log('');

  if (totalViolations === 0) {
    console.log('🎉 SUCCESS: All network calls are properly guarded!');
    console.log('✅ No direct fetch, WebSocket, or XMLHttpRequest calls found');
    console.log('✅ All network access goes through guardedFetch or guardedWebSocket');
  } else {
    console.log('❌ VIOLATIONS FOUND: Direct network calls detected');
    console.log('');
    
    violationsByFile.forEach(analysis => {
      console.log(`📄 ${analysis.file}:`);
      analysis.violations.forEach(violation => {
        console.log(`  ❌ ${violation.description}: ${violation.count} occurrence(s)`);
        if (violation.lines && violation.lines.length > 0) {
          violation.lines.forEach(line => {
            console.log(`     Line ${line.lineNumber}: ${line.content}`);
          });
        }
      });
      console.log('');
    });
  }

  // Check configuration
  console.log('🔧 CONFIGURATION CHECK');
  console.log('======================');
  try {
    const configContent = readFileSync('extension/src/config.ts', 'utf-8');
    const localOnlyMatch = configContent.match(/export\s+const\s+LOCAL_ONLY\s*=\s*(true|false)/);
    const allowNetworkMatch = configContent.match(/export\s+const\s+ALLOW_NETWORK\s*=\s*(true|false)/);
    
    if (localOnlyMatch && localOnlyMatch[1] === 'true') {
      console.log('✅ LOCAL_ONLY is set to true (local-only mode enabled)');
    } else {
      console.log('⚠️  LOCAL_ONLY is not set to true (local-only mode disabled)');
    }
    
    if (allowNetworkMatch && allowNetworkMatch[1] === 'false') {
      console.log('✅ ALLOW_NETWORK is set to false (network access disabled by default)');
    } else {
      console.log('⚠️  ALLOW_NETWORK is not set to false (network access enabled by default)');
    }
  } catch (error) {
    console.log('❌ Could not read configuration file');
  }

  console.log('');
  console.log('🎯 RECOMMENDATIONS');
  console.log('=================');
  
  if (totalViolations > 0) {
    console.log('1. Replace all direct fetch/WebSocket calls with guardedFetch/guardedWebSocket');
    console.log('2. Import the guard module in files that need network access');
    console.log('3. Handle NetworkDisabledError gracefully in your code');
  } else {
    console.log('1. All network calls are properly guarded ✓');
    console.log('2. Consider adding tests to verify network isolation');
    console.log('3. Document the local-only mode behavior for users');
  }

  // Exit with appropriate code
  process.exit(totalViolations > 0 ? 1 : 0);
}

// Run the analysis
analyzeNetworkPaths();