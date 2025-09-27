#!/usr/bin/env node

/**
 * OnboardingAudit.ai Benchmark Runner
 * 
 * This script loads benchmark fixtures from the corpus and runs deterministic
 * scoring to evaluate onboarding flow quality. Results are saved in a reproducible
 * format for comparison and analysis.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync, writeFileSync } from 'fs';

// Import the real HTML scoring function
import { scoreHTML } from './scoring-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BENCHMARKS_DIR = join(__dirname, '../benchmarks');
const CORPUS_DIR = join(BENCHMARKS_DIR, 'corpus');
const DEFAULT_SEED = 12345;
const DEFAULT_TIMESTAMP = 1609459200000; // 2021-01-01T00:00:00.000Z

// Command line arguments
const args = process.argv.slice(2);
const options = {
  category: args.find(arg => arg.startsWith('--category='))?.split('=')[1],
  seed: parseInt(args.find(arg => arg.startsWith('--seed='))?.split('=')[1] || DEFAULT_SEED),
  out: args.find(arg => arg.startsWith('--out='))?.split('=')[1] || join(BENCHMARKS_DIR, 'results.json'),
  perturbDom: args.find(arg => arg.startsWith('--perturb-dom='))?.split('=')[1] || 'none',
  verbose: args.includes('--verbose'),
  help: args.includes('--help') || args.includes('-h')
};

// Help text
const HELP_TEXT = `
OnboardingAudit.ai Benchmark Runner

Usage: node run-benchmarks.mjs [options]

Options:
  --category=<name>    Run only benchmarks in specified category
  --seed=<number>      Set random seed for reproducible results (default: ${DEFAULT_SEED})
  --perturb-dom=<mode> DOM perturbation mode: none|light (default: none)
  --verbose            Enable verbose output
  --help, -h           Show this help message

Categories:
  basic-signup         Basic signup flows
  saas                 SaaS onboarding flows
  ecommerce            E-commerce checkout flows
  mobile               Mobile app onboarding
  enterprise           Enterprise/B2B flows

DOM Perturbation Modes:
  none                 No DOM perturbation (default)
  light                Light perturbation: class hashing, wrapper divs, off-screen elements

Examples:
  node run-benchmarks.mjs
  node run-benchmarks.mjs --category=saas
  node run-benchmarks.mjs --seed=54321 --verbose
  node run-benchmarks.mjs --perturb-dom=light --seed=12345
`;

if (options.help) {
  console.log(HELP_TEXT);
  process.exit(0);
}

console.log('🏃 OnboardingAudit.ai Benchmark Runner');
console.log('=====================================\n');

// Load all benchmark fixtures
function loadBenchmarks() {
  const files = readdirSync(CORPUS_DIR)
    .filter(file => file.endsWith('.json'))
    .filter(file => !options.category || file.includes(options.category) || getCategoryFromFile(file) === options.category);
  
  if (files.length === 0) {
    console.log('❌ No benchmark fixtures found.');
    if (options.category) {
      console.log(`   No fixtures found for category: ${options.category}`);
    }
    process.exit(1);
  }
  
  const benchmarks = [];
  
  for (const file of files) {
    try {
      const content = readFileSync(join(CORPUS_DIR, file), 'utf8');
      const benchmark = JSON.parse(content);
      benchmarks.push(benchmark);
      
      if (options.verbose) {
        console.log(`📋 Loaded: ${benchmark.name} (${benchmark.category})`);
      }
    } catch (error) {
      console.error(`❌ Error loading ${file}: ${error.message}`);
    }
  }
  
  return benchmarks;
}

function getCategoryFromFile(filename) {
  // Extract category from filename or content
  try {
    const content = readFileSync(join(CORPUS_DIR, filename), 'utf8');
    const benchmark = JSON.parse(content);
    return benchmark.category;
  } catch {
    return 'unknown';
  }
}

// Deterministic PRNG implementation
class DeterministicPRNG {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    // LCG parameters from Numerical Recipes
    this.seed = (this.seed * 1664525 + 1013904223) % 0x100000000;
    return this.seed / 0x100000000;
  }
}

// DOM Perturbation Implementation
class DOMPerturbator {
  constructor(seed) {
    this.prng = new DeterministicPRNG(seed);
    this.classMap = new Map();
    
    // Utility class patterns (Tailwind-like) that should not be perturbed
    this.utilityPatterns = [
      // Layout
      /^container$/, /^mx-auto$/, /^px-/, /^py-/, /^m-/, /^p-/,
      // Flexbox & Grid
      /^flex$/, /^grid$/, /^items-/, /^justify-/, /^gap-/,
      // Width & Height
      /^w-/, /^h-/, /^min-w-/, /^min-h-/, /^max-w-/, /^max-h-/,
      // Display
      /^block$/, /^inline$/, /^hidden$/, /^visible$/,
      // Position
      /^relative$/, /^absolute$/, /^fixed$/, /^sticky$/,
      // Colors (background, text, border)
      /^bg-/, /^text-/, /^border-/, /^ring-/,
      // Spacing
      /^space-/, /^divide-/,
      // Typography
      /^font-/, /^text-/, /^leading-/, /^tracking-/,
      // Borders & Radius
      /^rounded$/, /^rounded-/, /^border$/, /^border-/,
      // Shadows
      /^shadow$/, /^shadow-/,
      // Transforms
      /^transform$/, /^scale-/, /^rotate-/, /^translate-/,
      // Transitions
      /^transition$/, /^duration-/, /^ease-/,
      // Z-index
      /^z-/,
      // Overflow
      /^overflow-/,
      // Object fit
      /^object-/,
      // Lists
      /^list-/,
      // Tables
      /^table$/, /^border-collapse$/, /^border-separate$/,
      // Forms
      /^appearance$/, /^placeholder-/,
      // Interactivity
      /^cursor-/, /^select-/, /^pointer-events-/,
      // SVG
      /^fill-/, /^stroke-/,
      // Accessibility
      /^sr-only$/, /^not-sr-only$/,
      // Responsive
      /^(sm|md|lg|xl|2xl):/,
      // States
      /^(hover|focus|active|disabled|visited):/,
      // Dark mode
      /^dark:/,
      // Group states
      /^group-hover:/, /^group-focus:/,
      // Focus states
      /^focus-within:/, /^focus-visible:/,
      // Print
      /^print:/,
      // Reduced motion
      /^motion-safe:/, /^motion-reduce:/
    ];
  }

  // Check if a class should be preserved (utility class)
  isUtilityClass(className) {
    return this.utilityPatterns.some(pattern => pattern.test(className));
  }

  // Generate a stable hash for a class name
  hashClassName(className) {
    if (this.classMap.has(className)) {
      return this.classMap.get(className);
    }
    
    // Don't perturb utility classes
    if (this.isUtilityClass(className)) {
      this.classMap.set(className, className);
      return className;
    }
    
    // Generate deterministic hash
    const hash = Math.abs(this.prng.next() * 0x100000000).toString(36).substring(0, 8);
    const hashedName = `hash-${hash}`;
    this.classMap.set(className, hashedName);
    return hashedName;
  }

  // Perturb HTML content
  perturbHTML(html) {
    if (!html || typeof html !== 'string') {
      return html;
    }

    let perturbed = html;

    // 1. Replace non-utility classes with stable hashes
    perturbed = perturbed.replace(/class="([^"]*)"/g, (match, classList) => {
      const classes = classList.split(/\s+/).filter(Boolean);
      const perturbedClasses = classes.map(className => {
        return this.hashClassName(className);
      });
      return `class="${perturbedClasses.join(' ')}"`;
    });

    // 2. Wrap <main> with extra <div data-noise> (no CSS)
    perturbed = perturbed.replace(/<main([^>]*)>([\s\S]*?)<\/main>/gi, (match, attrs, content) => {
      return `<div data-noise="wrapper"><main${attrs}>${content}</main></div>`;
    });

    // 3. Insert off-screen <span> near first <h1>
    const h1Match = perturbed.match(/<h1[^>]*>/i);
    if (h1Match) {
      const offScreenSpan = '<span style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden;" data-noise="offscreen">perturbation-marker</span>';
      perturbed = perturbed.replace(h1Match[0], `${h1Match[0]}${offScreenSpan}`);
    }

    return perturbed;
  }

  // Validate that perturbations don't break the HTML structure
  validatePerturbation(original, perturbed) {
    // Basic validation: ensure we haven't broken essential tags
    const essentialTags = ['<html', '<head', '<body', '<main'];
    for (const tag of essentialTags) {
      if ((original.includes(tag) && !perturbed.includes(tag)) ||
          (!original.includes(tag) && perturbed.includes(tag))) {
        console.warn(`⚠️  Perturbation validation failed: essential tag ${tag} changed`);
        return false;
      }
    }
    return true;
  }
}

// Mock environment for deterministic scoring
function createDeterministicEnv(seed, timestamp) {
  const prng = new DeterministicPRNG(seed);
  
  return {
    clock: {
      now: () => timestamp
    },
    random: () => prng.next()
  };
}

// Real HTML analysis is now handled by scoreHTML function from scoring-server.ts

// Run benchmarks
async function runBenchmarks() {
  console.log(`📊 Loading benchmark fixtures...`);
  const benchmarks = loadBenchmarks();
  console.log(`✅ Loaded ${benchmarks.length} benchmarks\n`);
  
  console.log(`🎯 Running benchmarks with seed: ${options.seed}`);
  const env = createDeterministicEnv(options.seed, DEFAULT_TIMESTAMP);
  
  // Initialize DOM perturbator if needed
  let perturbator = null;
  if (options.perturbDom !== 'none') {
    perturbator = new DOMPerturbator(options.seed);
    console.log(`🔧 DOM perturbation mode: ${options.perturbDom}`);
  }
  
  const results = [];
  let totalScore = 0;
  let minScore = 100;
  let maxScore = 0;
  
  for (const benchmark of benchmarks) {
    if (options.verbose) {
      console.log(`\n🔍 Running: ${benchmark.name}`);
    }
    
    if (perturbator && benchmark.html) {
      try {
        const originalHTML = benchmark.html;
        const perturbedHTML = perturbator.perturbHTML(originalHTML);
        
        if (perturbator.validatePerturbation(originalHTML, perturbedHTML)) {
          // For now, we'll keep the original heuristics since the scoring
          // is based on pre-computed heuristics data rather than live HTML analysis
          if (options.verbose) {
            console.log(`   📝 DOM perturbation applied`);
          }
        } else {
          console.warn(`   ⚠️  DOM perturbation validation failed for ${benchmark.name}`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Error applying DOM perturbation to ${benchmark.name}: ${error.message}`);
      }
    }
    
    // Use real HTML analysis for scoring
    let htmlContent = benchmark.html || '';
    let perturbedHTML = htmlContent;
    
    // Apply DOM perturbation if enabled
    if (perturbator && htmlContent) {
      try {
        const perturbedContent = perturbator.perturbHTML(htmlContent);
        if (perturbator.validatePerturbation(htmlContent, perturbedContent)) {
          perturbedHTML = perturbedContent;
          if (options.verbose) {
            console.log(`   📝 DOM perturbation applied`);
          }
        } else {
          console.warn(`   ⚠️  DOM perturbation validation failed for ${benchmark.name}`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Error applying DOM perturbation to ${benchmark.name}: ${error.message}`);
      }
    }
    
    // Use pre-computed heuristics from benchmark fixture
    let heuristics = benchmark.heuristics || {};
    
    // If we have HTML content, analyze it with enhanced heuristics
    if (perturbedHTML && perturbedHTML.trim().length > 0) {
      const { score, score_raw, score_calibrated, checks } = await scoreHTML(perturbedHTML, { env });
      
      const result = {
        id: benchmark.id,
        name: benchmark.name,
        category: benchmark.category,
        score: score_calibrated, // Use calibrated score as primary score
        score_raw: score_raw,
        score_calibrated: score_calibrated,
        checks: checks,
        expected_score_range: benchmark.expected_score_range,
        validation: {
          within_expected_range: score_calibrated >= benchmark.expected_score_range[0] &&
                                 score_calibrated <= benchmark.expected_score_range[1],
          meets_minimum: score_calibrated >= 0,
          meets_maximum: score_calibrated <= 100
        }
      };
      
      results.push(result);
      totalScore += score;
      minScore = Math.min(minScore, score);
      maxScore = Math.max(maxScore, score);
      
      if (options.verbose) {
        console.log(`   Score: ${score}/100`);
        console.log(`   Expected: [${benchmark.expected_score_range[0]}-${benchmark.expected_score_range[1]}]`);
        console.log(`   Validation: ${result.validation.within_expected_range ? '✅' : '❌'}`);
      }
      
      continue;
    }
    
    // Fallback: Calculate scores from pre-computed heuristics
    const { calculateScores } = await import('./scoring-server.js');
    const scores = calculateScores(heuristics);
    
    // Apply calibration if available
    let score_calibrated = scores.overall;
    let score_raw = scores.overall;
    
    try {
      // Load calibration configuration and apply calibration
      const calibrationConfigPath = join(__dirname, '../packages/core/src/calibration_v0_2c.json');
      const calibrationConfig = JSON.parse(readFileSync(calibrationConfigPath, 'utf8'));
      
      // Apply linear calibration: S_cal = a * S_raw + b, clamped to [0, 100]
      const calibrated = calibrationConfig.a * scores.overall + calibrationConfig.b;
      score_calibrated = Math.max(0, Math.min(100, calibrated));
    } catch (error) {
      // Calibration not available, use raw score
      score_calibrated = scores.overall;
    }
    
    // Convert scores to boolean checks (threshold: >= 60 for pass)
    const checks = {
      h_cta_above_fold: scores.h_cta_above_fold >= 60,
      h_steps_count: scores.h_steps_count >= 60,
      h_copy_clarity: scores.h_copy_clarity >= 60,
      h_trust_markers: scores.h_trust_markers >= 60,
      h_perceived_signup_speed: scores.h_perceived_signup_speed >= 60
    };
    
    const result = {
      id: benchmark.id,
      name: benchmark.name,
      category: benchmark.category,
      score: score_calibrated, // Use calibrated score as primary score
      score_raw: score_raw,
      score_calibrated: score_calibrated,
      checks: checks,
      expected_score_range: benchmark.expected_score_range,
      validation: {
        within_expected_range: score_calibrated >= benchmark.expected_score_range[0] &&
                               score_calibrated <= benchmark.expected_score_range[1],
        meets_minimum: score_calibrated >= 0,
        meets_maximum: score_calibrated <= 100
      }
    };
    
    results.push(result);
    totalScore += score_calibrated;
    minScore = Math.min(minScore, score_calibrated);
    maxScore = Math.max(maxScore, score_calibrated);
    
    if (options.verbose) {
      console.log(`   Score: ${score_calibrated}/100`);
      console.log(`   Expected: [${benchmark.expected_score_range[0]}-${benchmark.expected_score_range[1]}]`);
      console.log(`   Validation: ${result.validation.within_expected_range ? '✅' : '❌'}`);
    }
  }
  
  // Calculate summary statistics
  const averageScore = Math.round(totalScore / results.length);
  const medianScore = calculateMedian(results.map(r => r.score));
  
  const summary = {
    timestamp: new Date().toISOString(),
    seed: options.seed,
    total_benchmarks: results.length,
    summary: {
      average_score: averageScore,
      median_score: medianScore,
      min_score: minScore,
      max_score: maxScore
    },
    results
  };
  
  // Save results
  writeFileSync(options.out, JSON.stringify(summary, null, 2));
  
  console.log(`\n📈 Benchmark Results Summary`);
  console.log(`============================`);
  console.log(`Total benchmarks: ${results.length}`);
  console.log(`Average score: ${averageScore}/100`);
  console.log(`Median score: ${medianScore}/100`);
  console.log(`Score range: ${minScore} - ${maxScore}`);
  console.log(`\n✅ Results saved to: ${options.out}`);
  
  // Validation summary
  const validResults = results.filter(r => r.validation.within_expected_range);
  console.log(`\n🔍 Validation Summary:`);
  console.log(`   Within expected range: ${validResults.length}/${results.length} (${Math.round(validResults.length/results.length*100)}%)`);
  
  if (validResults.length < results.length) {
    const invalidResults = results.filter(r => !r.validation.within_expected_range);
    console.log(`   ⚠️  ${invalidResults.length} benchmarks outside expected range:`);
    invalidResults.forEach(r => {
      console.log(`      - ${r.name}: ${r.score}/100 (expected: [${r.expected_score_range[0]}-${r.expected_score_range[1]}])`);
    });
  }
}

function calculateMedian(scores) {
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

// Run the benchmarks
try {
  await runBenchmarks();
  console.log('\n🎉 Benchmark run completed successfully!');
} catch (error) {
  console.error('\n❌ Benchmark run failed:', error.message);
  if (options.verbose) {
    console.error(error.stack);
  }
  process.exit(1);
}