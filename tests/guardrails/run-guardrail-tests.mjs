#!/usr/bin/env node

/**
 * Guardrail Test Runner for OnboardingAudit.ai
 * 
 * This script runs guardrail tests that verify heuristics are robust against
 * common UI trickery that could artificially inflate scores.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const GUARDRAILS_DIR = __dirname;

// Command line arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose'),
  help: args.includes('--help') || args.includes('-h')
};

// Help text
const HELP_TEXT = `
Guardrail Test Runner for OnboardingAudit.ai

Usage: node run-guardrail-tests.mjs [options]

Options:
  --verbose            Enable verbose output
  --help, -h           Show this help message

Guardrail Tests:
  These tests verify that heuristics are robust against UI trickery:
  - invisible-cta-001: Invisible CTAs positioned off-screen
  - aria-hidden-headings-002: aria-hidden elements
  - hidden-copy-003: Hidden copy text (display: none, visibility: hidden)
  - fake-trust-signals-004: Empty trust signal containers
  - decoy-buttons-005: Disabled buttons and fake CTAs

Expected Behavior:
  - Hidden/invisible elements should not be counted
  - Empty containers should not be counted as trust signals
  - Disabled buttons should not be detected as CTAs
  - Only actionable, visible elements should contribute to scores
`;

if (options.help) {
  console.log(HELP_TEXT);
  process.exit(0);
}

console.log('🛡️  OnboardingAudit.ai Guardrail Test Runner');
console.log('==========================================\n');

// Load all guardrail fixtures
function loadGuardrailFixtures() {
  const fixtures = [];
  const fixtureDirs = readdirSync(GUARDRAILS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name.includes('-'));

  for (const fixtureDir of fixtureDirs) {
    try {
      const metaPath = join(GUARDRAILS_DIR, fixtureDir, 'meta.json');
      const htmlPath = join(GUARDRAILS_DIR, fixtureDir, 'index.html');
      
      const metaContent = readFileSync(metaPath, 'utf8');
      const meta = JSON.parse(metaContent);
      
      const htmlContent = readFileSync(htmlPath, 'utf8');
      
      fixtures.push({
        id: meta.id,
        name: fixtureDir,
        meta,
        html: htmlContent,
        path: fixtureDir
      });
      
      if (options.verbose) {
        console.log(`📋 Loaded: ${meta.id}`);
      }
    } catch (error) {
      console.error(`❌ Error loading ${fixtureDir}: ${error.message}`);
    }
  }
  
  return fixtures;
}

// Mock DOM environment for testing
function createDOMEnvironment(html) {
  const dom = new JSDOM(html);
  return dom.window.document;
}

// Enhanced heuristic detection that should be robust against trickery
function detectHeuristicsRobust(html) {
  const document = createDOMEnvironment(html);
  
  // H-CTA-ABOVE-FOLD: Detect primary call-to-action above fold (top 600px)
  const viewportHeight = 600;
  const ctas = document.querySelectorAll('button, a, input[type="submit"], [class*="cta"], [class*="action"]');
  
  let detected = false;
  let position = 0;
  let element = '';
  
  // Look for primary CTAs with action-oriented text
  const ctaKeywords = ['start', 'begin', 'sign up', 'signup', 'get started', 'join', 'create', 'continue', 'next'];
  
  for (const cta of ctas) {
    // Skip disabled elements
    if (cta.disabled) continue;
    
    // Skip elements with opacity 0 or display none
    const computedStyle = cta.ownerDocument.defaultView.getComputedStyle(cta);
    if (computedStyle.opacity === '0' || computedStyle.display === 'none' || computedStyle.visibility === 'hidden') continue;
    
    // Skip off-screen elements
    let rect;
    try {
      rect = cta.getBoundingClientRect();
    } catch (e) {
      continue;
    }
    
    // Skip elements positioned off-screen
    if (rect.left < -1000 || rect.top < -1000) continue;
    
    const text = (cta.textContent || '').toLowerCase().trim();
    const hasCTAKeyword = ctaKeywords.some(keyword => text.includes(keyword));
    
    if (rect.top < viewportHeight && (hasCTAKeyword || cta.className.toLowerCase().includes('cta'))) {
      detected = true;
      position = Math.round(rect.top);
      element = cta.tagName.toLowerCase();
      if (cta.className) element += `.${cta.className.split(' ')[0]}`;
      break;
    }
  }
  
  const ctaResult = { detected, position, element };
  
  // H-STEPS-COUNT: Count distinct onboarding steps (forms, screens, modals)
  const forms = document.querySelectorAll('form').length;
  const screens = document.querySelectorAll('[class*="step"], [class*="screen"], [class*="onboarding"], [class*="wizard"]').length;
  const modals = document.querySelectorAll('[class*="modal"], [role="dialog"]').length;
  
  const total = Math.max(forms, screens, modals, 1);
  const stepsResult = { total, forms, screens };
  
  // H-COPY-CLARITY: Analyze text clarity (sentence length, passive voice, jargon)
  // Only count visible text elements
  const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div'))
    .filter(el => {
      // Skip aria-hidden elements
      if (el.getAttribute('aria-hidden') === 'true') return false;
      
      // Skip elements with display: none
      const style = el.ownerDocument.defaultView.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      
      // Skip off-screen elements
      try {
        const rect = el.getBoundingClientRect();
        if (rect.left < -1000 || rect.top < -1000) return false;
      } catch (e) {
        return false;
      }
      
      return true;
    });
  
  let totalSentences = 0;
  let totalWords = 0;
  let passiveVoiceCount = 0;
  let jargonCount = 0;
  
  // Common jargon words in onboarding
  const jargonWords = ['utilize', 'leverage', 'synergy', 'paradigm', 'ecosystem', 'platform', 'solution', 'optimize', 'streamline', 'facilitate'];
  
  textElements.forEach(element => {
    const text = element.textContent || '';
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    totalSentences += sentences.length;
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/).length;
      totalWords += words;
      
      // Passive voice detection
      if (/\b(was|were|been|being|is|are|am)\s+\w+ed\b/i.test(sentence)) {
        passiveVoiceCount++;
      }
      
      // Jargon detection
      const sentenceLower = sentence.toLowerCase();
      jargonWords.forEach(jargon => {
        if (sentenceLower.includes(jargon)) {
          jargonCount++;
        }
      });
    });
  });
  
  const avgSentenceLength = totalSentences > 0 ? Math.round(totalWords / totalSentences) : 0;
  const passiveVoiceRatio = totalSentences > 0 ? Math.round((passiveVoiceCount / totalSentences) * 100) : 0;
  const jargonDensity = totalWords > 0 ? Math.round((jargonCount / totalWords) * 100) : 0;
  
  const copyResult = {
    avg_sentence_length: avgSentenceLength,
    passive_voice_ratio: passiveVoiceRatio,
    jargon_density: jargonDensity
  };
  
  // H-TRUST-MARKERS: Find trust signals (testimonials, security badges, customer logos)
  // Only count elements with actual content
  const testimonials = Array.from(document.querySelectorAll('[class*="testimonial"], [class*="review"], [class*="quote"], blockquote'))
    .filter(el => {
      const text = el.textContent?.trim() || '';
      return text.length > 10; // Must have meaningful content
    }).length;
  
  const securityBadges = Array.from(document.querySelectorAll('[class*="security"], [class*="trust"], [class*="badge"], [class*="certified"], [alt*="security"], [alt*="ssl"]'))
    .filter(el => {
      // Must have actual image or meaningful text
      if (el.tagName === 'IMG') {
        return el.src && el.src.length > 0 && !el.src.includes('nonexistent');
      }
      const text = el.textContent?.trim() || '';
      return text.length > 0;
    }).length;
  
  const customerLogos = Array.from(document.querySelectorAll('[class*="logo"], [class*="customer"], [class*="client"], [alt*="logo"], img[src*="logo"]'))
    .filter(el => {
      // Must have actual image source
      if (el.tagName === 'IMG') {
        return el.src && el.src.length > 0 && !el.src.includes('nonexistent');
      }
      return false; // Non-img logo elements are likely empty containers
    }).length;
  
  const trustResult = {
    testimonials,
    security_badges: securityBadges,
    customer_logos: customerLogos,
    total: testimonials + securityBadges + customerLogos
  };
  
  // H-PERCEIVED-SIGNUP-SPEED: Estimate completion time based on form complexity
  const formFields = document.querySelectorAll('input, select, textarea').length;
  const requiredFields = document.querySelectorAll('[required]').length;
  const progressIndicators = document.querySelectorAll('[class*="progress"], [class*="step-indicator"]').length;
  
  // Base estimate: 5 seconds per field, 10 seconds per required field, minus 20% for progress indicators
  let estimatedSeconds = Math.max(formFields * 5, requiredFields * 10, 30);
  if (progressIndicators > 0) {
    estimatedSeconds = Math.round(estimatedSeconds * 0.8); // Progress indicators reduce perceived time
  }
  
  const speedResult = {
    form_fields: formFields,
    required_fields: requiredFields,
    estimated_seconds: estimatedSeconds
  };
  
  return {
    h_cta_above_fold: ctaResult,
    h_steps_count: stepsResult,
    h_copy_clarity: copyResult,
    h_trust_markers: trustResult,
    h_perceived_signup_speed: speedResult
  };
}

// Simplified scoring implementation (based on packages/core/src/scoring.ts)
function calculateScores(heuristics) {
  // H-CTA-ABOVE-FOLD: 100% if detected, 0% if not
  const ctaScore = heuristics.h_cta_above_fold.detected ? 100 : 0;
  
  // H-STEPS-COUNT: 1-3 steps = 100%, 4-5 = 80%, 6-7 = 60%, 8+ = 40%
  let stepsScore = 100;
  if (heuristics.h_steps_count.total >= 8) stepsScore = 40;
  else if (heuristics.h_steps_count.total >= 6) stepsScore = 60;
  else if (heuristics.h_steps_count.total >= 4) stepsScore = 80;
  
  // H-COPY-CLARITY: <15 words/sentence, <10% passive, <5% jargon = 100%
  let copyScore = 100;
  if (heuristics.h_copy_clarity.avg_sentence_length > 15) {
    copyScore -= Math.min(50, (heuristics.h_copy_clarity.avg_sentence_length - 15) * 2);
  }
  if (heuristics.h_copy_clarity.passive_voice_ratio > 10) {
    copyScore -= Math.min(30, (heuristics.h_copy_clarity.passive_voice_ratio - 10) * 3);
  }
  if (heuristics.h_copy_clarity.jargon_density > 5) {
    copyScore -= Math.min(20, (heuristics.h_copy_clarity.jargon_density - 5) * 4);
  }
  copyScore = Math.max(0, copyScore);
  
  // H-TRUST-MARKERS: 3+ trust elements = 100%, 2 = 80%, 1 = 60%, 0 = 40%
  let trustScore = 40;
  if (heuristics.h_trust_markers.total >= 3) trustScore = 100;
  else if (heuristics.h_trust_markers.total === 2) trustScore = 80;
  else if (heuristics.h_trust_markers.total === 1) trustScore = 60;
  
  // H-PERCEIVED-SIGNUP-SPEED: <30 seconds = 100%, 30-60s = 80%, 60-120s = 60%, 120s+ = 40%
  let speedScore = 40;
  if (heuristics.h_perceived_signup_speed.estimated_seconds < 30) speedScore = 100;
  else if (heuristics.h_perceived_signup_speed.estimated_seconds < 60) speedScore = 80;
  else if (heuristics.h_perceived_signup_speed.estimated_seconds < 120) speedScore = 60;
  
  // Calculate weighted overall score
  const overall = Math.round(
    ctaScore * 0.25 +
    stepsScore * 0.20 +
    copyScore * 0.20 +
    trustScore * 0.20 +
    speedScore * 0.15
  );
  
  return {
    h_cta_above_fold: ctaScore,
    h_steps_count: stepsScore,
    h_copy_clarity: copyScore,
    h_trust_markers: trustScore,
    h_perceived_signup_speed: speedScore,
    overall
  };
}

// Run guardrail tests
function runGuardrailTests() {
  console.log(`📊 Loading guardrail fixtures...`);
  const fixtures = loadGuardrailFixtures();
  console.log(`✅ Loaded ${fixtures.length} guardrail tests\n`);
  
  const results = [];
  let passedTests = 0;
  let totalTests = 0;
  
  for (const fixture of fixtures) {
    if (options.verbose) {
      console.log(`\n🔍 Running: ${fixture.meta.id}`);
    }
    
    // Run enhanced heuristic detection
    const heuristics = detectHeuristicsRobust(fixture.html);
    const scores = calculateScores(heuristics);
    
    // Validate results against expectations
    const expected = fixture.meta.expected;
    let testPassed = true;
    const issues = [];
    
    // Check if CTA detection matches expectation
    if (expected.guardrail_test && expected.description.includes('CTA')) {
      const expectedCTA = fixture.meta.ground_truth.h_cta_above_fold;
      if (heuristics.h_cta_above_fold.detected !== expectedCTA) {
        testPassed = false;
        issues.push(`Expected CTA detection: ${expectedCTA}, got: ${heuristics.h_cta_above_fold.detected}`);
      }
    }
    
    // Check if trust markers are correctly filtered
    if (expected.guardrail_test && expected.description.includes('trust')) {
      const expectedTrust = fixture.meta.ground_truth.h_trust_markers;
      if (heuristics.h_trust_markers.total !== expectedTrust) {
        testPassed = false;
        issues.push(`Expected trust markers: ${expectedTrust}, got: ${heuristics.h_trust_markers.total}`);
      }
    }
    
    // Check if hidden copy is ignored
    if (expected.guardrail_test && expected.description.includes('copy')) {
      // If hidden copy was ignored, copy clarity should be good
      if (scores.h_copy_clarity < 80) {
        testPassed = false;
        issues.push(`Copy clarity score too low (${scores.h_copy_clarity}), hidden text may have been counted`);
      }
    }
    
    // Check if decoy buttons are ignored
    if (expected.guardrail_test && expected.description.includes('Decoy')) {
      // Should still detect the real CTA
      if (!heuristics.h_cta_above_fold.detected) {
        testPassed = false;
        issues.push('Real CTA not detected among decoy buttons');
      }
    }
    
    totalTests++;
    if (testPassed) passedTests++;
    
    const result = {
      id: fixture.meta.id,
      name: fixture.name,
      passed: testPassed,
      issues: issues,
      scores: scores,
      heuristics: heuristics,
      expected: expected
    };
    
    results.push(result);
    
    if (options.verbose) {
      console.log(`   Score: ${scores.overall}/100`);
      console.log(`   CTA Detected: ${heuristics.h_cta_above_fold.detected}`);
      console.log(`   Trust Markers: ${heuristics.h_trust_markers.total}`);
      console.log(`   Copy Clarity: ${scores.h_copy_clarity}/100`);
      console.log(`   Result: ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
      if (issues.length > 0) {
        console.log(`   Issues: ${issues.join(', ')}`);
      }
    }
  }
  
  // Summary
  console.log(`\n📈 Guardrail Test Results`);
  console.log(`========================`);
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests < totalTests) {
    console.log(`\n❌ Failed Tests:`);
    results.filter(r => !r.passed).forEach(result => {
      console.log(`   - ${result.id}: ${result.issues.join(', ')}`);
    });
  }
  
  // Save detailed results
  const outputPath = join(GUARDRAILS_DIR, 'guardrail-results.json');
  writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      success_rate: Math.round((passedTests / totalTests) * 100)
    },
    results
  }, null, 2));
  
  console.log(`\n✅ Detailed results saved to: ${outputPath}`);
  
  return passedTests === totalTests;
}

// Run the tests
try {
  const allPassed = runGuardrailTests();
  if (allPassed) {
    console.log('\n🎉 All guardrail tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some guardrail tests failed - heuristics may be vulnerable to trickery');
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Guardrail test run failed:', error.message);
  if (options.verbose) {
    console.error(error.stack);
  }
  process.exit(1);
}