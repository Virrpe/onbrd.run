#!/usr/bin/env node

/**
 * Error Analysis Script for OnboardingAudit.ai Benchmarks
 * 
 * This script loads benchmark results and performs detailed error analysis
 * to identify false positives and false negatives by category.
 */

import { readFileSync, writeFileSync } from 'fs';

// Command line arguments
const args = process.argv.slice(2);
const resultsPath = args.find(arg => arg.startsWith('--results='))?.split('=')[1];
const outPath = args.find(arg => arg.startsWith('--out='))?.split('=')[1];

if (!resultsPath || !outPath) {
  console.error('Usage: node scripts/error_analysis.mjs --results=<path> --out=<path>');
  process.exit(1);
}

console.log(`🔍 Analyzing errors in ${resultsPath}...`);

// Load results
const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

// Initialize error tracking
const errors = {
  false_positives: {},
  false_negatives: {},
  confusion_matrix: {},
  by_category: {}
};

// Initialize check tracking
const checks = ['h_cta_above_fold', 'h_steps_count', 'h_copy_clarity', 'h_trust_markers', 'h_perceived_signup_speed'];

// Initialize confusion matrices for each check
checks.forEach(check => {
  errors.confusion_matrix[check] = {
    true_positives: 0,
    false_positives: 0,
    true_negatives: 0,
    false_negatives: 0
  };
});

// Analyze each result
results.results.forEach(result => {
  const { id, name, category, score, checks: result_checks, expected_score_range } = result;
  
  // Initialize category tracking
  if (!errors.by_category[category]) {
    errors.by_category[category] = {
      total: 0,
      errors: 0,
      false_positives: [],
      false_negatives: []
    };
  }
  errors.by_category[category].total++;
  
  // For each check, determine if it's a false positive or false negative
  // We need to infer expected values from the score ranges and heuristics
  checks.forEach(check => {
    const predicted = result_checks[check];
    
    // Infer expected based on score range and heuristics
    // This is a simplified approach - in practice we'd need ground truth labels
    const expected = inferExpected(check, result, expected_score_range);
    
    // Update confusion matrix
    if (predicted && expected) {
      errors.confusion_matrix[check].true_positives++;
    } else if (predicted && !expected) {
      errors.confusion_matrix[check].false_positives++;
      errors.by_category[category].errors++;
      
      // Track false positive details
      errors.by_category[category].false_positives.push({
        id,
        name,
        check,
        score,
        reason: getFalsePositiveReason(check, result)
      });
    } else if (!predicted && expected) {
      errors.confusion_matrix[check].false_negatives++;
      errors.by_category[category].errors++;
      
      // Track false negative details
      errors.by_category[category].false_negatives.push({
        id,
        name,
        check,
        score,
        reason: getFalseNegativeReason(check, result)
      });
    } else {
      errors.confusion_matrix[check].true_negatives++;
    }
  });
});

// Helper function to infer expected values (simplified)
function inferExpected(check, result, expected_range) {
  const [min_score, max_score] = expected_range;
  const avg_score = (min_score + max_score) / 2;
  
  // Higher scores generally mean more positive checks
  if (check === 'h_cta_above_fold' || check === 'h_trust_markers') {
    return avg_score >= 60; // These are binary-like checks
  }
  
  // For other checks, use score threshold
  return avg_score >= 50;
}

// Helper function to get false positive reasons
function getFalsePositiveReason(check, _result) {
  const reasons = {
    h_cta_above_fold: "CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold)",
    h_steps_count: "Too many steps detected (possibly counting navigation or decorative elements)",
    h_copy_clarity: "Copy clarity flagged as good but shouldn't be (possibly short text or simple language)",
    h_trust_markers: "Trust markers detected but shouldn't be (possibly decorative icons or false positives)",
    h_perceived_signup_speed: "Signup speed estimated as fast but shouldn't be (possibly missing required fields or time cues)"
  };
  
  return reasons[check] || "Unknown reason";
}

// Helper function to get false negative reasons
function getFalseNegativeReason(check, _result) {
  const reasons = {
    h_cta_above_fold: "CTA not detected above fold but should be (possibly below threshold or hidden)",
    h_steps_count: "Steps not counted properly (possibly complex flow or missing indicators)",
    h_copy_clarity: "Copy clarity issues missed (possibly complex language or long sentences)",
    h_trust_markers: "Trust markers not detected (possibly subtle indicators or missing elements)",
    h_perceived_signup_speed: "Signup speed issues missed (possibly long forms or missing time indicators)"
  };
  
  return reasons[check] || "Unknown reason";
}

// Calculate precision, recall, and F1 for each check
const metrics = {};
checks.forEach(check => {
  const cm = errors.confusion_matrix[check];
  const precision = cm.true_positives + cm.false_positives > 0 
    ? cm.true_positives / (cm.true_positives + cm.false_positives) 
    : 0;
  const recall = cm.true_positives + cm.false_negatives > 0 
    ? cm.true_positives / (cm.true_positives + cm.false_negatives) 
    : 0;
  const f1 = precision + recall > 0 
    ? 2 * (precision * recall) / (precision + recall) 
    : 0;
  
  metrics[check] = { precision, recall, f1 };
});

// Generate markdown report
const markdownReport = `# Error Analysis Report

Generated: ${new Date().toISOString()}
Results: ${resultsPath}

## Summary

- Total benchmarks analyzed: ${results.results.length}
- Total errors detected: ${Object.values(errors.by_category).reduce((sum, cat) => sum + cat.errors, 0)}
- Error rate: ${(Object.values(errors.by_category).reduce((sum, cat) => sum + cat.errors, 0) / (results.results.length * checks.length) * 100).toFixed(1)}%

## Per-Check Performance

${checks.map(check => {
  const cm = errors.confusion_matrix[check];
  const m = metrics[check];
  return `### ${check}

- Precision: ${(m.precision * 100).toFixed(1)}%
- Recall: ${(m.recall * 100).toFixed(1)}%
- F1: ${(m.f1 * 100).toFixed(1)}%
- True Positives: ${cm.true_positives}
- False Positives: ${cm.false_positives}
- True Negatives: ${cm.true_negatives}
- False Negatives: ${cm.false_negatives}

`;
}).join('\n')}

## Top Errors by Category

${Object.entries(errors.by_category)
  .filter(([_, cat]) => cat.errors > 0)
  .sort(([,a], [,b]) => b.errors - a.errors)
  .map(([category, cat]) => {
    return `### ${category} (${cat.errors} errors, ${(cat.errors/cat.total*100).toFixed(1)}% error rate)

#### False Positives (${cat.false_positives.length})
${cat.false_positives.slice(0, 5).map(fp => `- **${fp.name}**: ${fp.reason} (score: ${fp.score})`).join('\n')}

#### False Negatives (${cat.false_negatives.length})
${cat.false_negatives.slice(0, 5).map(fn => `- **${fn.name}**: ${fn.reason} (score: ${fn.score})`).join('\n')}

`;
  }).join('\n')}

## Recommendations for v0.2.c Improvements

Based on this error analysis, focus on:

1. **h_cta_above_fold**: ${errors.confusion_matrix.h_cta_above_fold.false_positives} false positives, ${errors.confusion_matrix.h_cta_above_fold.false_negatives} false negatives
   - ${errors.confusion_matrix.h_cta_above_fold.false_positives > errors.confusion_matrix.h_cta_above_fold.false_negatives ? 'Focus on reducing false positives' : 'Focus on reducing false negatives'}

2. **h_trust_markers**: ${errors.confusion_matrix.h_trust_markers.false_positives} false positives, ${errors.confusion_matrix.h_trust_markers.false_negatives} false negatives
   - ${errors.confusion_matrix.h_trust_markers.false_positives > errors.confusion_matrix.h_trust_markers.false_negatives ? 'Focus on reducing false positives' : 'Focus on reducing false negatives'}

3. **Overall**: Target the categories with highest error rates for heuristic improvements.
`;

// Write markdown report
writeFileSync(outPath, markdownReport);
console.log(`✅ Error analysis report saved to: ${outPath}`);

// Also write JSON for programmatic access
const jsonReport = {
  generated_at: new Date().toISOString(),
  results_path: resultsPath,
  summary: {
    total_benchmarks: results.results.length,
    total_errors: Object.values(errors.by_category).reduce((sum, cat) => sum + cat.errors, 0),
    error_rate: Object.values(errors.by_category).reduce((sum, cat) => sum + cat.errors, 0) / (results.results.length * checks.length)
  },
  confusion_matrices: errors.confusion_matrix,
  metrics,
  by_category: errors.by_category
};

const jsonOutPath = outPath.replace('.md', '.json');
writeFileSync(jsonOutPath, JSON.stringify(jsonReport, null, 2));
console.log(`✅ JSON error data saved to: ${jsonOutPath}`);

console.log('\n📊 Error Analysis Complete!');
console.log(`   Total errors: ${Object.values(errors.by_category).reduce((sum, cat) => sum + cat.errors, 0)}`);
console.log(`   Error rate: ${(Object.values(errors.by_category).reduce((sum, cat) => sum + cat.errors, 0) / (results.results.length * checks.length) * 100).toFixed(1)}%`);