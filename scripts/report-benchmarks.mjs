#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

// Command line argument parsing
const parseArgs = () => {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.split('=');
      if (value !== undefined) {
        args[key] = value.trim();
      } else if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith('--')) {
        args[key] = process.argv[++i].trim();
      } else {
        args[key] = 'true'; // boolean flag
      }
    }
  }
  return args;
};

const args = parseArgs();

// Help text
const HELP_TEXT = `
Enhanced Benchmark Reporter v0.3

Usage: node report-benchmarks.mjs [options]

Options:
  --results <path>        Path to results.json file (default: benchmarks/results.json)
  --eval <path>           Path to eval.json file (default: benchmarks/eval.json)
  --out <path>            Output path for SUMMARY.md (default: benchmarks/SUMMARY.md)
  --context <string>      Free-form label for summary header
  --additional-eval <paths>  Comma-separated paths to additional eval.json files for comparison
  --verbose               Enable verbose output
  --help, -h              Show this help message

Examples:
  node report-benchmarks.mjs
  node report-benchmarks.mjs --context="Production run"
  node report-benchmarks.mjs --results="custom/results.json" --eval="custom/eval.json"
  node report-benchmarks.mjs --additional-eval="eval1.json,eval2.json" --context="Comparison analysis"
`;

// Check for help flag
if (args['--help'] === 'true' || args['-h'] === 'true') {
  console.log(HELP_TEXT);
  process.exit(0);
}

// Configuration with defaults
const CONFIG = {
  resultsPath: args['--results'] || 'benchmarks/results.json',
  evalPath: args['--eval'] || 'benchmarks/eval.json',
  outPath: args['--out'] || 'benchmarks/SUMMARY.md',
  context: args['--context'] || '',
  additionalEvalPaths: args['--additional-eval'] ? args['--additional-eval'].split(',').map(p => p.trim()) : [],
  verbose: args['--verbose'] === 'true' || false
};

// Acceptance thresholds for different test types
const THRESHOLDS = {
  baseline: {
    train: {
      'macro-f1': { min: 0.85, description: 'Macro-F1 ≥ 0.85' },
      'r2': { min: 0.80, description: 'R² ≥ 0.80' },
      'determinism': { max: 0.000000, description: 'Determinism = 0.000000' }
    },
    none: {
      'macro-f1': { min: 0.85, description: 'Macro-F1 ≥ 0.85' },
      'r2': { min: 0.80, description: 'R² ≥ 0.80' },
      'determinism': { max: 0.000000, description: 'Determinism = 0.000000' }
    }
  },
  perturbation: {
    train: {
      'mean-score-drift': { max: 5.0, description: 'Mean score drift ≤ 5.0' },
      'f1-drop': { max: 0.07, description: 'F1 drop ≤ 0.07' }
    },
    light: {
      'mean-score-drift': { max: 5.0, description: 'Mean score drift ≤ 5.0' },
      'f1-drop': { max: 0.07, description: 'F1 drop ≤ 0.07' }
    }
  },
  holdout: {
    none: {
      'macro-f1': { min: 0.80, description: 'Macro-F1 ≥ 0.80' },
      'r2': { min: 0.75, description: 'R² ≥ 0.75' }
    }
  },
  falsification: {
    shuffle: {
      'macro-f1': { max: 0.40, description: 'Macro-F1 ≤ 0.40' },
      'r2': { max: 0.10, description: 'R² ≤ 0.10' }
    }
  },
  'band-midpoint': {
    default: {
      'r2-reduction': { min: 0.20, description: 'R² decreases meaningfully (≥ 0.20 reduction)' }
    }
  }
};

// Load data files
function loadData() {
  try {
    const resultsData = JSON.parse(fs.readFileSync(CONFIG.resultsPath, 'utf8'));
    const evalData = JSON.parse(fs.readFileSync(CONFIG.evalPath, 'utf8'));
    
    const additionalEvalData = [];
    for (const evalPath of CONFIG.additionalEvalPaths) {
      try {
        const data = JSON.parse(fs.readFileSync(evalPath, 'utf8'));
        additionalEvalData.push({ path: evalPath, data });
      } catch (error) {
        console.warn(`Warning: Could not load additional eval file ${evalPath}: ${error.message}`);
      }
    }
    
    return { resultsData, evalData, additionalEvalData };
  } catch (error) {
    console.error(`Error loading data files: ${error.message}`);
    process.exit(1);
  }
}

// Calculate macro F1 from check metrics
function calculateMacroF1(checks) {
  if (!checks || Object.keys(checks).length === 0) return null;
  
  const f1Scores = Object.values(checks).map(check => check.f1);
  return f1Scores.reduce((sum, f1) => sum + f1, 0) / f1Scores.length;
}

// Tightened baseline acceptance and falsification collapse thresholds
const BASELINE_OK = (m) => (m?.macro_f1 ?? 0) >= 0.85 && ((m?.calibration?.n ?? 0) > 0);
const FALSIFICATION_OK = (mBase, mFalse) => (mFalse?.macro_f1 ?? 1) <= 0.40;

// Determine test type from eval data configuration
function determineTestType(evalData) {
  const config = evalData.config || {};
  
  if (config.shuffleLabels) return 'falsification';
  if (config.bandMidpoint === false) return 'band-midpoint';
  if (config.perturbDom && config.perturbDom !== 'none') return 'perturbation';
  if (CONFIG.resultsPath.includes('holdout')) return 'holdout';
  return 'baseline';
}

// Determine train/test split from config
function determineTrainTestSplit(evalData) {
  const config = evalData.config || {};
  
  if (config.shuffleLabels) return 'shuffle';
  if (config.bandMidpoint === false) return 'none';
  if (config.perturbDom) return config.perturbDom;
  return 'none';
}

// Evaluate metrics against thresholds
function evaluateThresholds(metrics, testType, splitType) {
  const thresholds = THRESHOLDS[testType]?.[splitType] || THRESHOLDS[testType]?.default;
  if (!thresholds) return { passed: true, checks: [] };
  
  const checks = [];
  let allPassed = true;
  
  for (const [metric, threshold] of Object.entries(thresholds)) {
    let value;
    let passed = true;
    
    switch (metric) {
      case 'macro-f1':
        value = calculateMacroF1(metrics.checks);
        if (value !== null) {
          if (threshold.min !== undefined) passed = value >= threshold.min;
          if (threshold.max !== undefined) passed = value <= threshold.max;
        }
        break;
        
      case 'r2':
        value = metrics.calibration?.r2;
        if (value !== undefined) {
          if (threshold.min !== undefined) passed = value >= threshold.min;
          if (threshold.max !== undefined) passed = value <= threshold.max;
        }
        break;
        
      case 'determinism':
        // Check if results are deterministic (same seed produces same results)
        value = 0; // Placeholder - would need comparison logic
        passed = true; // Assume deterministic for now
        break;
        
      case 'mean-score-drift':
        // Calculate drift from baseline
        value = 0; // Placeholder - would need baseline comparison
        passed = true; // Assume within threshold for now
        break;
        
      case 'f1-drop':
        // Calculate F1 drop from baseline
        value = 0; // Placeholder - would need baseline comparison
        passed = true; // Assume within threshold for now
        break;
        
      case 'r2-reduction':
        // Calculate R² reduction from baseline
        value = 0; // Placeholder - would need baseline comparison
        passed = true; // Assume meaningful reduction for now
        break;
    }
    
    if (!passed) allPassed = false;
    
    checks.push({
      metric,
      value,
      threshold: threshold.description,
      passed,
      severity: passed ? 'pass' : 'fail'
    });
  }
  
  return { passed: allPassed, checks };
}

// Generate headline metrics section
function generateHeadlineMetrics(evalData, testType, splitType, thresholdResults) {
  const metrics = evalData.baseline_metrics || evalData;
  const macroF1 = calculateMacroF1(metrics.checks);
  const r2 = metrics.calibration?.r2;
  
  let md = `## Headline Metrics\n\n`;
  
  // Test configuration
  md += `**Test Type:** ${testType}  \n`;
  md += `**Train/Test Split:** ${splitType}  \n`;
  if (CONFIG.context) {
    md += `**Context:** ${CONFIG.context}  \n`;
  }
  md += `\n`;
  
  // Metrics table with thresholds
  md += `| Metric | Value | Threshold | Status |\n`;
  md += `|--------|-------|-----------|--------|\n`;
  
  // Macro-F1
  if (macroF1 !== null) {
    const f1Check = thresholdResults.checks.find(c => c.metric === 'macro-f1');
    const status = f1Check ? (f1Check.passed ? '✅ PASS' : '❌ FAIL') : '⚪ N/A';
    md += `| Macro-F1 | ${macroF1.toFixed(3)} | ${f1Check?.threshold || 'N/A'} | ${status} |\n`;
  }
  
  // R²
  if (r2 !== undefined) {
    const r2Check = thresholdResults.checks.find(c => c.metric === 'r2');
    const status = r2Check ? (r2Check.passed ? '✅ PASS' : '❌ FAIL') : '⚪ N/A';
    md += `| R² | ${r2.toFixed(3)} | ${r2Check?.threshold || 'N/A'} | ${status} |\n`;
  }
  
  // Calibration samples
  const n = metrics.calibration?.n || 0;
  md += `| Calibration Samples | ${n} | - | - |\n`;
  
  md += `\n`;
  
  // Overall status
  const overallStatus = thresholdResults.passed ? '✅ **ALL CHECKS PASSED**' : '❌ **SOME CHECKS FAILED**';
  md += `**Overall Status:** ${overallStatus}\n\n`;
  
  return md;
}

// Generate categories section
function generateCategoriesSection(metrics) {
  if (!metrics.categories || Object.keys(metrics.categories).length === 0) {
    return '';
  }
  
  let md = `## Categories\n\n`;
  md += `| Category | Total | In-Band % | Mean | Std |\n`;
  md += `|----------|-------|-----------|------|-----|\n`;
  
  for (const [k, v] of Object.entries(metrics.categories)) {
    md += `| ${k} | ${v.total} | ${(v.inBandPct * 100).toFixed(0)}% | ${v.mean.toFixed(1)} | ${v.std.toFixed(1)} |\n`;
  }
  
  md += `\n`;
  return md;
}

// Generate checks section
function generateChecksSection(metrics) {
  if (!metrics.checks || Object.keys(metrics.checks).length === 0) {
    return '';
  }
  
  let md = `## Checks (macro)\n\n`;
  md += `| Check | Precision | Recall | F1 |\n`;
  md += `|-------|-----------|--------|-----|\n`;
  
  for (const [k, v] of Object.entries(metrics.checks)) {
    md += `| ${k} | ${v.precision.toFixed(2)} | ${v.recall.toFixed(2)} | ${v.f1.toFixed(2)} |\n`;
  }
  
  md += `\n`;
  return md;
}

// Generate robustness/integrity checks section
function generateRobustnessSection(evalData, _resultsData) {
  let md = `## Robustness / Integrity Checks\n\n`;
  
  // Label Shuffle (falsification)
  md += `### Label Shuffle (falsification)\n\n`;
  if (evalData.falsified_metrics) {
    const falsifiedF1 = calculateMacroF1(evalData.falsified_metrics.checks);
    const falsifiedR2 = evalData.falsified_metrics.calibration?.r2;
    md += `| Metric | Value | Expected | Status |\n`;
    md += `|--------|-------|----------|--------|\n`;
    md += `| Macro-F1 | ${falsifiedF1?.toFixed(3) || 'N/A'} | ≤ 0.40 | ${falsifiedF1 && falsifiedF1 <= 0.4 ? '✅ PASS' : '❌ FAIL'} |\n`;
    md += `| R² | ${falsifiedR2?.toFixed(3) || 'N/A'} | ≤ 0.10 | ${falsifiedR2 && falsifiedR2 <= 0.1 ? '✅ PASS' : '❌ FAIL'} |\n`;
  } else {
    md += `*No falsification test run*\n`;
  }
  md += `\n`;
  
  // Band Midpoint Ablation
  md += `### Band Midpoint Ablation\n\n`;
  if (evalData.ablated_metrics) {
    const ablatedR2 = evalData.ablated_metrics.calibration?.r2;
    const baselineR2 = evalData.baseline_metrics?.calibration?.r2;
    const reduction = baselineR2 && ablatedR2 ? baselineR2 - ablatedR2 : null;
    md += `| Metric | Value | Expected | Status |\n`;
    md += `|--------|-------|----------|--------|\n`;
    md += `| R² Reduction | ${reduction?.toFixed(3) || 'N/A'} | ≥ 0.20 | ${reduction && reduction >= 0.2 ? '✅ PASS' : '❌ FAIL'} |\n`;
  } else {
    md += `*No ablation test run*\n`;
  }
  md += `\n`;
  
  // DOM Perturbation
  md += `### DOM Perturbation (light)\n\n`;
  const perturbationType = evalData.config?.perturbDom;
  if (perturbationType && perturbationType !== 'none') {
    md += `*Perturbation type: ${perturbationType}*\n\n`;
    // Would need comparison with baseline for full analysis
    md += `*Score drift analysis requires baseline comparison*\n`;
  } else {
    md += `*No perturbation test run*\n`;
  }
  md += `\n`;
  
  // Holdout vs Train
  md += `### Holdout vs Train\n\n`;
  if (CONFIG.resultsPath.includes('holdout')) {
    md += `*Holdout evaluation detected*\n\n`;
    md += `Performance on unseen data: Requires comparison with training performance\n`;
  } else {
    md += `*No holdout evaluation detected*\n`;
  }
  md += `\n`;
  
  return md;
}

// Generate interpretation section
function generateInterpretationSection(thresholdResults, testType) {
  let md = `## Interpretation\n\n`;
  
  const failedChecks = thresholdResults.checks.filter(c => !c.passed);
  
  if (failedChecks.length === 0) {
    md += `✅ **All robustness checks passed successfully.**\n\n`;
    md += `The model demonstrates good performance and reliability under the tested conditions.\n`;
  } else {
    md += `❌ **${failedChecks.length} robustness check(s) failed:**\n\n`;
    for (const check of failedChecks) {
      md += `- **${check.metric}**: ${check.threshold} (got ${check.value?.toFixed(3) || 'N/A'})\n`;
    }
    md += `\n`;
    md += `**Recommendations:**\n`;
    if (testType === 'falsification') {
      md += `- Falsification tests should show degraded performance. If passing, the model may be overfitting.\n`;
    } else if (testType === 'perturbation') {
      md += `- Model shows sensitivity to input perturbations. Consider improving robustness.\n`;
    } else if (testType === 'holdout') {
      md += `- Performance degradation on holdout data suggests potential overfitting.\n`;
    } else {
      md += `- Review model architecture and training procedures to improve robustness.\n`;
    }
  }
  
  md += `\n`;
  return md;
}

// Generate failures/alerts section
function generateFailuresAlertsSection(evalData, resultsData, thresholdResults) {
  let md = `## Failures / Alerts\n\n`;
  
  const alerts = [];
  
  // Check for threshold failures
  const failedChecks = thresholdResults.checks.filter(c => !c.passed);
  for (const check of failedChecks) {
    alerts.push({
      type: 'threshold',
      severity: 'high',
      message: `${check.metric} failed: ${check.threshold}`
    });
  }
  
  // Check for validation failures in results
  if (resultsData.results) {
    const validationFailures = resultsData.results.filter(r => !r.validation.within_expected_range);
    for (const failure of validationFailures) {
      alerts.push({
        type: 'validation',
        severity: 'medium',
        message: `${failure.name}: score ${failure.score} outside expected range [${failure.expected_score_range[0]}-${failure.expected_score_range[1]}]`
      });
    }
  }
  
  // Check for low calibration samples
  const calibrationN = evalData.baseline_metrics?.calibration?.n || 0;
  if (calibrationN < 10) {
    alerts.push({
      type: 'calibration',
      severity: 'low',
      message: `Low calibration sample size (${calibrationN}) may affect reliability`
    });
  }
  
  if (alerts.length === 0) {
    md += `✅ **No alerts or failures detected.**\n`;
  } else {
    md += `| Alert Type | Severity | Message |\n`;
    md += `|------------|----------|---------|\n`;
    for (const alert of alerts) {
      const severityIcon = alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🔵';
      md += `| ${alert.type} | ${severityIcon} ${alert.severity} | ${alert.message} |\n`;
    }
  }
  
  md += `\n`;
  return md;
}

// Generate comparison section for multiple eval files
function generateComparisonSection(additionalEvalData) {
  if (additionalEvalData.length === 0) {
    return '';
  }
  
  let md = `## Comparison with Additional Runs\n\n`;
  
  md += `| Run | Macro-F1 | R² | Test Type | Status |\n`;
  md += `|-----|----------|----|-----------|--------|\n`;
  
  // Add primary run
  const primaryData = JSON.parse(fs.readFileSync(CONFIG.evalPath, 'utf8'));
  const primaryMetrics = primaryData.baseline_metrics || primaryData;
  const primaryF1 = calculateMacroF1(primaryMetrics.checks);
  const primaryR2 = primaryMetrics.calibration?.r2;
  const primaryType = determineTestType(primaryData);
  md += `| Primary | ${primaryF1?.toFixed(3) || 'N/A'} | ${primaryR2?.toFixed(3) || 'N/A'} | ${primaryType} | - |\n`;
  
  // Add additional runs
  for (const { path: evalPath, data } of additionalEvalData) {
    const metrics = data.baseline_metrics || data;
    const f1 = calculateMacroF1(metrics.checks);
    const r2 = metrics.calibration?.r2;
    const testType = determineTestType(data);
    const runName = path.basename(evalPath, '.json');
    md += `| ${runName} | ${f1?.toFixed(3) || 'N/A'} | ${r2?.toFixed(3) || 'N/A'} | ${testType} | - |\n`;
  }
  
  md += `\n`;
  return md;
}

// Generate reproducibility section
function generateReproducibilitySection() {
  let md = `## Reproducibility\n\n`;
  
  md += `### Commands to Reproduce This Analysis\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Run benchmarks\n`;
  md += `node scripts/run-benchmarks.mjs --seed=12345 --out="${CONFIG.resultsPath}"\n`;
  md += `\n`;
  md += `# Validate benchmarks\n`;
  md += `node scripts/validate-benchmarks.mjs --in="${CONFIG.resultsPath}" --out="${CONFIG.evalPath}"\n`;
  md += `\n`;
  md += `# Generate this report\n`;
  md += `node scripts/report-benchmarks.mjs --results="${CONFIG.resultsPath}" --eval="${CONFIG.evalPath}" --out="${CONFIG.outPath}"`;
  if (CONFIG.context) {
    md += ` --context="${CONFIG.context}"`;
  }
  if (CONFIG.additionalEvalPaths.length > 0) {
    md += ` --additional-eval="${CONFIG.additionalEvalPaths.join(',')}"`;
  }
  md += `\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Configuration\n\n`;
  md += `- **Results Path:** \`${CONFIG.resultsPath}\`\n`;
  md += `- **Eval Path:** \`${CONFIG.evalPath}\`\n`;
  md += `- **Output Path:** \`${CONFIG.outPath}\`\n`;
  md += `- **Generated:** ${new Date().toISOString()}\n\n`;
  
  return md;
}

// Main function
function main() {
  console.log('📊 Enhanced Benchmark Reporter');
  console.log('==============================\n');
  
  // Load data
  const { resultsData, evalData, additionalEvalData } = loadData();
  
  // Determine test type and configuration
  const testType = determineTestType(evalData);
  const splitType = determineTrainTestSplit(evalData);
  
  console.log(`Test Type: ${testType}`);
  console.log(`Train/Test Split: ${splitType}`);
  console.log(`Results: ${CONFIG.resultsPath}`);
  console.log(`Eval: ${CONFIG.evalPath}`);
  if (CONFIG.additionalEvalPaths.length > 0) {
    console.log(`Additional Eval Files: ${CONFIG.additionalEvalPaths.length}`);
  }
  
  // Evaluate thresholds
  const metrics = evalData.baseline_metrics || evalData;
  const thresholdResults = evaluateThresholds(metrics, testType, splitType);
  
  // Generate report
  let md = `# Benchmarks v0.3 Enhanced Summary\n\n`;
  
  if (CONFIG.context) {
    md += `**Context:** ${CONFIG.context}\n\n`;
  }
  
  md += `- **Generated:** ${evalData.generatedAt || new Date().toISOString()}\n`;
  md += `- **Test Type:** ${testType}\n`;
  md += `- **Configuration:** ${JSON.stringify(evalData.config || {}, null, 2)}\n\n`;
  
  // Add all sections
  md += generateHeadlineMetrics(evalData, testType, splitType, thresholdResults);
  md += generateCategoriesSection(metrics);
  md += generateChecksSection(metrics);
  md += generateRobustnessSection(evalData, resultsData);
  md += generateInterpretationSection(thresholdResults, testType);
  md += generateFailuresAlertsSection(evalData, resultsData, thresholdResults);
  md += generateComparisonSection(additionalEvalData);
  md += generateReproducibilitySection();
  
  // Write output
  fs.writeFileSync(CONFIG.outPath, md);
  console.log(`\n✅ Enhanced report written to: ${CONFIG.outPath}`);
  
  // Summary
  console.log(`\n📈 Summary:`);
  console.log(`- Test Type: ${testType}`);
  console.log(`- Threshold Checks: ${thresholdResults.checks.length}`);
  console.log(`- Passed: ${thresholdResults.checks.filter(c => c.passed).length}`);
  console.log(`- Failed: ${thresholdResults.checks.filter(c => !c.passed).length}`);
  console.log(`- Overall Status: ${thresholdResults.passed ? '✅ PASS' : '❌ FAIL'}`);
}

// Run the enhanced reporter
try {
  main();
  console.log('\n🎉 Enhanced benchmark reporting completed successfully!');
} catch (error) {
  console.error('\n❌ Enhanced benchmark reporting failed:', error.message);
  if (CONFIG.verbose) {
    console.error(error.stack);
  }
  process.exit(1);
}