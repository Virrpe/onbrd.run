#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

// Files to fix
const files = [
  'benchmarks/results.train.none.json',
  'benchmarks/results.train.light.json', 
  'benchmarks/results.holdout.none.json'
];

function fixBenchmarkData(inputPath, outputPath) {
  console.log(`Fixing ${inputPath}...`);
  
  const data = JSON.parse(readFileSync(inputPath, 'utf8'));
  
  // Transform each result
  const fixedResults = data.results.map(result => {
    const { expected_score_range, expected, ...rest } = result;
    
    // Create expected_score_band from expected_score_range
    const expected_score_band = {
      min: expected_score_range[0],
      max: expected_score_range[1],
      midpoint: (expected_score_range[0] + expected_score_range[1]) / 2
    };
    
    return {
      ...rest,
      expected_score_band,
      expected: {
        score_band: expected_score_range,
        checks: expected
      }
    };
  });
  
  const fixedData = {
    ...data,
    results: fixedResults
  };
  
  writeFileSync(outputPath, JSON.stringify(fixedData, null, 2));
  console.log(`Fixed data written to ${outputPath}`);
}

// Fix all files
for (const file of files) {
  const outputPath = file.replace('.json', '.fixed.json');
  fixBenchmarkData(file, outputPath);
}

console.log('All benchmark files fixed!');