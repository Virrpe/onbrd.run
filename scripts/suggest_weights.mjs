#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const resultsPath = args.find(arg => arg.startsWith('--results='))?.split('=')[1] || 'benchmarks/results.train.none.json';
const outputPath = args.find(arg => arg.startsWith('--out='))?.split('=')[1] || 'packages/core/src/rules/weights.v0_2c.json';

console.log(`Loading results from: ${resultsPath}`);
console.log(`Output weights to: ${outputPath}`);

// Load results data
const resultsData = JSON.parse(readFileSync(resultsPath, 'utf8'));
const results = resultsData.results;

console.log(`Loaded ${results.length} benchmark results`);

// Generate weight combinations using 5-point grid (0.1 to 0.4 in 0.075 steps)
function generateWeightCombinations() {
  const combinations = [];
  const step = 0.075;
  const minWeight = 0.10;
  const maxWeight = 0.40;
  
  for (let cta = minWeight; cta <= maxWeight; cta += step) {
    for (let steps = minWeight; steps <= maxWeight; steps += step) {
      for (let copy = minWeight; copy <= maxWeight; copy += step) {
        for (let trust = minWeight; trust <= maxWeight; trust += step) {
          const speed = 1.0 - (cta + steps + copy + trust);
          // Allow small rounding errors and reasonable bounds
          if (speed >= 0.05 && speed <= 0.45) {
            combinations.push({
              CTA: Math.round(cta * 1000) / 1000,
              Steps: Math.round(steps * 1000) / 1000,
              Copy: Math.round(copy * 1000) / 1000,
              Trust: Math.round(trust * 1000) / 1000,
              Speed: Math.round(speed * 1000) / 1000
            });
          }
        }
      }
    }
  }
  
  return combinations;
}

// Calculate R² correlation between predicted and expected scores
function calculateR2(predictions, actuals) {
  const n = predictions.length;
  if (n === 0) return 0;
  
  const meanActual = actuals.reduce((sum, val) => sum + val, 0) / n;
  
  let ssRes = 0; // Sum of squares of residuals
  let ssTot = 0; // Total sum of squares
  
  for (let i = 0; i < n; i++) {
    ssRes += Math.pow(predictions[i] - actuals[i], 2);
    ssTot += Math.pow(actuals[i] - meanActual, 2);
  }
  
  return ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
}

// Calculate macro-F1 score based on pass/fail classification
function calculateMacroF1(results, weights) {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let trueNegatives = 0;
  
  for (const result of results) {
    // Calculate expected score (midpoint of range)
    const expectedScore = (result.expected_score_range[0] + result.expected_score_range[1]) / 2;
    
    // Calculate predicted score using weighted checks
    let weightedScore = 0;
    let totalWeight = 0;
    
    // Apply weights to each check
    if (result.checks.h_cta_above_fold) {
      weightedScore += weights.CTA * 100;
      totalWeight += weights.CTA;
    }
    if (result.checks.h_steps_count) {
      weightedScore += weights.Steps * 100;
      totalWeight += weights.Steps;
    }
    if (result.checks.h_copy_clarity) {
      weightedScore += weights.Copy * 100;
      totalWeight += weights.Copy;
    }
    if (result.checks.h_trust_markers) {
      weightedScore += weights.Trust * 100;
      totalWeight += weights.Trust;
    }
    if (result.checks.h_perceived_signup_speed) {
      weightedScore += weights.Speed * 100;
      totalWeight += weights.Speed;
    }
    
    // Normalize score
    const predictedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    
    // Determine pass/fail based on expected range
    const actualPass = result.validation.within_expected_range;
    const predictedPass = predictedScore >= 50;
    
    // Update confusion matrix
    if (predictedPass && actualPass) {
      truePositives++;
    } else if (predictedPass && !actualPass) {
      falsePositives++;
    } else if (!predictedPass && actualPass) {
      falseNegatives++;
    } else if (!predictedPass && !actualPass) {
      trueNegatives++;
    }
  }
  
  // Calculate precision, recall, and F1
  const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
  const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
  const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  
  return f1;
}

// Main optimization function
function findOptimalWeights() {
  console.log('Generating weight combinations...');
  const combinations = generateWeightCombinations();
  console.log(`Testing ${combinations.length} weight combinations...`);
  
  let bestWeights = null;
  let bestMacroF1 = -1;
  let bestR2 = -1;
  
  for (let i = 0; i < combinations.length; i++) {
    const weights = combinations[i];
    
    // Calculate macro-F1
    const macroF1 = calculateMacroF1(results, weights);
    
    // Calculate R² using score correlation
    const predictions = [];
    const actuals = [];
    
    for (const result of results) {
      // Calculate predicted score
      let weightedScore = 0;
      let totalWeight = 0;
      
      if (result.checks.h_cta_above_fold) {
        weightedScore += weights.CTA * 100;
        totalWeight += weights.CTA;
      }
      if (result.checks.h_steps_count) {
        weightedScore += weights.Steps * 100;
        totalWeight += weights.Steps;
      }
      if (result.checks.h_copy_clarity) {
        weightedScore += weights.Copy * 100;
        totalWeight += weights.Copy;
      }
      if (result.checks.h_trust_markers) {
        weightedScore += weights.Trust * 100;
        totalWeight += weights.Trust;
      }
      if (result.checks.h_perceived_signup_speed) {
        weightedScore += weights.Speed * 100;
        totalWeight += weights.Speed;
      }
      
      const predictedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
      const expectedScore = (result.expected_score_range[0] + result.expected_score_range[1]) / 2;
      
      predictions.push(predictedScore);
      actuals.push(expectedScore);
    }
    
    const r2 = calculateR2(predictions, actuals);
    
    // Update best weights (prioritize macro-F1, then R² as tiebreaker)
    if (macroF1 > bestMacroF1 || (macroF1 === bestMacroF1 && r2 > bestR2)) {
      bestMacroF1 = macroF1;
      bestR2 = r2;
      bestWeights = { ...weights };
    }
    
    // Progress indicator
    if ((i + 1) % 100 === 0) {
      console.log(`Progress: ${i + 1}/${combinations.length} combinations tested`);
    }
  }
  
  console.log(`\nOptimal weights found:`);
  console.log(`CTA: ${bestWeights.CTA}`);
  console.log(`Steps: ${bestWeights.Steps}`);
  console.log(`Copy: ${bestWeights.Copy}`);
  console.log(`Trust: ${bestWeights.Trust}`);
  console.log(`Speed: ${bestWeights.Speed}`);
  console.log(`Macro-F1: ${bestMacroF1.toFixed(4)}`);
  console.log(`R²: ${bestR2.toFixed(4)}`);
  
  return {
    weights: bestWeights,
    macroF1: bestMacroF1,
    r2: bestR2
  };
}

// Run optimization
console.log('\nStarting weight optimization...');
const result = findOptimalWeights();

// Save optimal weights
const weightsConfig = {
  version: "v0.2.c",
  timestamp: new Date().toISOString(),
  weights: result.weights,
  metrics: {
    macroF1: result.macroF1,
    r2: result.r2
  }
};

writeFileSync(outputPath, JSON.stringify(weightsConfig, null, 2));
console.log(`\nOptimal weights saved to: ${outputPath}`);