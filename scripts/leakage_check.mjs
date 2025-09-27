#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Ground truth keys that should NOT be used directly in heuristic code
const GROUND_TRUTH_KEYS = [
  'h_cta_above_fold',
  'h_steps_count', 
  'h_copy_clarity',
  'h_trust_markers',
  'h_perceived_signup_speed_sec',
  'a11y_focus_trap'
];

// Patterns that indicate potential leakage
const LEAKAGE_PATTERNS = {
  // Direct meta.json imports in scoring/probe code (high risk)
  metaJsonImport: /import.*meta\.json|require.*meta\.json|from.*meta\.json/gi,
  
  // Direct fixture directory access in scoring/probe code (high risk)
  fixturePathAccess: /fixtures_holdout|benchmarks\/fixtures/gi,
  
  // Ground truth keys used as DOM selectors or hardcoded values (high risk)
  // Only flag when used in DOM selection contexts or as hardcoded strings
  groundTruthAsString: new RegExp(GROUND_TRUTH_KEYS.map(key =>
    `querySelector.*["'\`]${key}["'\`]|getElementById.*["'\`]${key}["'\`]|getElementsByClassName.*["'\`]${key}["'\`]|createElement.*["'\`]${key}["'\`]`
  ).join('|'), 'gi'),
  
  // Ground truth keys used as object properties in scoring context (medium risk)
  // Only flag when accessing ground truth object properties, not heuristic object properties
  groundTruthAsProperty: new RegExp(GROUND_TRUTH_KEYS.map(key =>
    `ground_truth.*\\.${key}\\s*[=:]|groundTruth.*\\.${key}\\s*[=:]|metaData\\.ground_truth.*\\.${key}`
  ).join('|'), 'gi'),
  
  // Direct ground truth access patterns (high risk)
  groundTruthAccess: /ground_truth|groundTruth/gi,
  
  // Fixture directory traversal in scoring code (high risk)
  fixtureTraversal: /readdirSync.*fixtures|readFileSync.*fixtures.*meta\.json/gi
};

// Files that are allowed to reference ground truth (test/benchmark scripts)
const ALLOWED_FILES = [
  'scripts/leakage_check.mjs',
  'scripts/validate-benchmarks.mjs',
  'scripts/run-benchmarks.mjs',
  'scripts/gen-fixture.mjs',
  'scripts/test-report-metadata.js',
  'scripts/verify.ts'
];

// Files that should be strictly clean (scoring/probe logic)
const STRICT_FILES = [
  'packages/core/src/scoring.ts',
  'packages/core/src/probes.ts'
];

/**
 * Check if a file should be strictly clean (no ground truth references)
 * @param {string} filePath - Relative file path
 * @returns {boolean} - True if file should be strictly clean
 */
function isStrictFile(filePath) {
  // Check exact matches
  if (STRICT_FILES.includes(filePath)) return true;
  
  // Check directory patterns
  return filePath.startsWith('packages/core/src/probes/') || 
         filePath.startsWith('packages/core/src/rules/');
}

/**
 * Check if a file is allowed to reference ground truth (test/benchmark scripts)
 * @param {string} filePath - Relative file path
 * @returns {boolean} - True if file is allowed to reference ground truth
 */
function isAllowedFile(filePath) {
  return ALLOWED_FILES.includes(filePath);
}

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx', '.mjs'];

// Directories to scan
const SCAN_DIRECTORIES = [
  'packages/core/src',
  'packages/core/src/probes',
  'packages/core/src/rules',
  'scripts'
];

// Directories to exclude
const EXCLUDE_DIRECTORIES = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'test-results',
  'playwright-report'
];

class LeakageDetector {
  constructor() {
    this.findings = [];
    this.scannedFiles = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  shouldScanFile(filePath) {
    const ext = extname(filePath);
    if (!SCAN_EXTENSIONS.includes(ext)) return false;
    
    const relativePath = filePath.replace(ROOT_DIR + '/', '');
    
    // Check if file is in excluded directory
    for (const excludeDir of EXCLUDE_DIRECTORIES) {
      if (relativePath.startsWith(excludeDir + '/')) return false;
    }
    
    // Check if file is in scan directory
    for (const scanDir of SCAN_DIRECTORIES) {
      if (relativePath.startsWith(scanDir + '/')) return true;
    }
    
    return false;
  }

  getLineNumbers(content, pattern) {
    const lines = content.split('\n');
    const lineNumbers = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        lineNumbers.push(i + 1);
      }
    }
    
    return lineNumbers;
  }

  scanFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      this.scannedFiles++;
      
      const relativePath = filePath.replace(ROOT_DIR + '/', '');
      
      // Skip allowed files (they can reference ground truth for testing)
      if (isAllowedFile(relativePath)) {
        return;
      }
      
      let fileFindings = [];

      // For strict files (scoring/probe logic), apply all patterns strictly
      if (isStrictFile(relativePath)) {
        // Check for meta.json imports (critical violation)
        const metaImports = content.match(LEAKAGE_PATTERNS.metaJsonImport);
        if (metaImports) {
          fileFindings.push({
            type: 'meta_json_import',
            pattern: 'meta.json import in scoring logic',
            matches: metaImports,
            line: this.getLineNumbers(content, metaImports[0]),
            severity: 'critical'
          });
        }

        // Check for fixture path access (critical violation)
        const fixtureAccess = content.match(LEAKAGE_PATTERNS.fixturePathAccess);
        if (fixtureAccess) {
          fileFindings.push({
            type: 'fixture_path_access',
            pattern: 'fixture directory access in scoring logic',
            matches: fixtureAccess,
            line: this.getLineNumbers(content, fixtureAccess[0]),
            severity: 'critical'
          });
        }

        // Check for ground truth access (critical violation)
        const groundTruthAccess = content.match(LEAKAGE_PATTERNS.groundTruthAccess);
        if (groundTruthAccess) {
          fileFindings.push({
            type: 'ground_truth_access',
            pattern: 'direct ground truth access in scoring logic',
            matches: groundTruthAccess,
            line: this.getLineNumbers(content, groundTruthAccess[0]),
            severity: 'critical'
          });
        }

        // Check for ground truth as DOM selectors (critical violation)
        const groundTruthStrings = content.match(LEAKAGE_PATTERNS.groundTruthAsString);
        if (groundTruthStrings) {
          fileFindings.push({
            type: 'ground_truth_string',
            pattern: 'ground truth key used as DOM selector',
            matches: [...new Set(groundTruthStrings)],
            line: this.getLineNumbers(content, groundTruthStrings[0]),
            severity: 'critical'
          });
        }
      } else {
        // For other files, only flag high-risk patterns
        const groundTruthAccess = content.match(LEAKAGE_PATTERNS.groundTruthAccess);
        if (groundTruthAccess) {
          fileFindings.push({
            type: 'ground_truth_access',
            pattern: 'direct ground truth access',
            matches: groundTruthAccess,
            line: this.getLineNumbers(content, groundTruthAccess[0]),
            severity: 'medium'
          });
        }
      }

      if (fileFindings.length > 0) {
        this.findings.push({
          file: relativePath,
          findings: fileFindings
        });
      }

    } catch (error) {
      this.log(`Error scanning file ${filePath}: ${error.message}`, 'error');
    }
  }

  scanDirectory(dirPath) {
    try {
      const items = readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Recursively scan subdirectories
          if (!EXCLUDE_DIRECTORIES.includes(item)) {
            this.scanDirectory(fullPath);
          }
        } else if (stat.isFile() && this.shouldScanFile(fullPath)) {
          this.scanFile(fullPath);
        }
      }
    } catch (error) {
      this.log(`Error scanning directory ${dirPath}: ${error.message}`, 'error');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 ONBOARDING AUDIT LEAKAGE DETECTION REPORT');
    console.log('='.repeat(80));
    console.log(`📊 Scanned ${this.scannedFiles} files`);
    console.log(`🔍 Found ${this.findings.length} files with potential leakage`);
    console.log('');

    if (this.findings.length === 0) {
      console.log('✅ No leakage detected! All files appear clean.');
      return;
    }

    console.log('⚠️  POTENTIAL LEAKAGE FOUND:');
    console.log('');

    this.findings.forEach((fileFindings, index) => {
      console.log(`${index + 1}. 📄 ${fileFindings.file}`);
      
      fileFindings.findings.forEach(finding => {
        const severityIcon = finding.severity === 'critical' ? '🚨' : '⚠️';
        console.log(`   ${severityIcon} ${finding.type.replace(/_/g, ' ').toUpperCase()}`);
        console.log(`      Pattern: ${finding.pattern}`);
        console.log(`      Line(s): ${finding.line.join(', ')}`);
        console.log(`      Matches: ${finding.matches.slice(0, 3).join(', ')}${finding.matches.length > 3 ? '...' : ''}`);
        console.log('');
      });
    });

    console.log('\n📋 SUMMARY:');
    console.log('-'.repeat(40));
    
    const summary = {};
    this.findings.forEach(fileFindings => {
      fileFindings.findings.forEach(finding => {
        summary[finding.type] = (summary[finding.type] || 0) + 1;
      });
    });

    Object.entries(summary).forEach(([type, count]) => {
      console.log(`  ${type.replace(/_/g, ' ')}: ${count}`);
    });

    console.log('');
    console.log('🚨 LEAKAGE DETECTED - This indicates the scoring system may be using');
    console.log('   ground truth data directly, which would invalidate benchmark results.');
    console.log('='.repeat(80));
  }

  hasLeakage() {
    return this.findings.length > 0;
  }

  run() {
    this.log('Starting leakage detection scan...');
    
    // Scan specified directories
    for (const dir of SCAN_DIRECTORIES) {
      const fullDirPath = join(ROOT_DIR, dir);
      this.log(`Scanning directory: ${dir}`);
      this.scanDirectory(fullDirPath);
    }

    this.log(`Scan complete. Analyzed ${this.scannedFiles} files.`);
    this.generateReport();

    if (this.hasLeakage()) {
      this.log('LEAKAGE DETECTED - Exiting with error code', 'error');
      process.exit(1);
    } else {
      this.log('No leakage detected - Exiting successfully', 'info');
      process.exit(0);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const detector = new LeakageDetector();
  detector.run();
}

export { LeakageDetector, GROUND_TRUTH_KEYS, LEAKAGE_PATTERNS };