#!/usr/bin/env node

/**
 * Fit Calibration Parameters for OnboardingAudit.ai v0.2.c
 * 
 * This script fits linear calibration parameters (a, b) using OLS on training data.
 * S_cal = a * S_raw + b
 * 
 * Usage: node scripts/fit_calibration.mjs --results=benchmarks/results.train.none.json --out=packages/core/src/calibration_v0_2c.json
 */

import { readFileSync, writeFileSync } from 'fs';
// No path utilities needed for this script

// Parse command line arguments
const args = process.argv.slice(2);
const resultsPath = args.find(arg => arg.startsWith('--results='))?.split('=')[1];
const outPath = args.find(arg => arg.startsWith('--out='))?.split('=')[1];

if (!resultsPath || !outPath) {
  console.error('Usage: node scripts/fit_calibration.mjs --results=<path> --out=<path>');
  process.exit(1);
}

console.log(`📊 Fitting calibration parameters from ${resultsPath}...`);

// Load results
const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

// Extract raw scores and target scores
const rawScores = [];
const targetScores = [];

results.results.forEach(result => {
  const rawScore = result.score; // This is the raw heuristic score
  const expectedRange = result.expected_score_range;
  
  // Use midpoint of expected range as target
  const [minExpected, maxExpected] = expectedRange;
  const targetScore = Math.round((minExpected + maxExpected) / 2);
  
  rawScores.push(rawScore);
  targetScores.push(targetScore);
});

console.log(`📈 Found ${rawScores.length} training samples`);

// Import calibration functions (we'll implement the OLS here to avoid circular dependencies)
function fitCalibrationOLS(rawScores, targetScores) {
  const n = rawScores.length;
  
  if (n < 2) {
    throw new Error("Need at least 2 samples to fit calibration");
  }

  // Calculate means
  const meanX = rawScores.reduce((sum, x) => sum + x, 0) / n;
  const meanY = targetScores.reduce((sum, y) => sum + y, 0) / n;
  
  // Calculate slope (a) and intercept (b) using OLS formulas
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = rawScores[i] - meanX;
    const yDiff = targetScores[i] - meanY;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }
  
  if (denominator === 0) {
    // All raw scores are the same, use identity transform
    return { a: 1.0, b: 0.0 };
  }
  
  const a = numerator / denominator;
  const b = meanY - a * meanX;
  
  return { a, b };
}

// Fit calibration parameters
const { a, b } = fitCalibrationOLS(rawScores, targetScores);

console.log(`🔧 Fitted calibration: a=${a.toFixed(4)}, b=${b.toFixed(4)}`);

// Create calibration configuration
const config = {
  a: Math.round(a * 10000) / 10000, // Round to 4 decimal places for determinism
  b: Math.round(b * 10000) / 10000,
  version: "v0.2c",
  fitted_on: new Date().toISOString(),
  n_samples: rawScores.length
};

// Save configuration
writeFileSync(outPath, JSON.stringify(config, null, 2));
console.log(`✅ Calibration configuration saved to: ${outPath}`);

// Calculate and display some statistics
const calibratedScores = rawScores.map(raw => {
  const calibrated = a * raw + b;
  return Math.max(0, Math.min(100, calibrated));
});

const mse = rawScores.reduce((sum, _, i) => {
  const diff = calibratedScores[i] - targetScores[i];
  return sum + diff * diff;
}, 0) / rawScores.length;

const rmse = Math.sqrt(mse);
const correlation = calculateCorrelation(rawScores, targetScores);

console.log(`📊 Calibration Statistics:`);
console.log(`   RMSE: ${rmse.toFixed(2)}`);
console.log(`   Correlation with targets: ${correlation.toFixed(3)}`);
console.log(`   Raw score range: [${Math.min(...rawScores)}, ${Math.max(...rawScores)}]`);
console.log(`   Target score range: [${Math.min(...targetScores)}, ${Math.max(...targetScores)}]`);
console.log(`   Calibrated score range: [${Math.min(...calibratedScores)}, ${Math.max(...calibratedScores)}]`);

function calculateCorrelation(x, y) {
  const n = x.length;
  const meanX = x.reduce((sum, xi) => sum + xi, 0) / n;
  const meanY = y.reduce((sum, yi) => sum + yi, 0) / n;
  
  let numerator = 0;
  let sumSquaresX = 0;
  let sumSquaresY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    sumSquaresX += diffX * diffX;
    sumSquaresY += diffY * diffY;
  }
  
  if (sumSquaresX === 0 || sumSquaresY === 0) {
    return 0;
  }
  
  return numerator / Math.sqrt(sumSquaresX * sumSquaresY);
}