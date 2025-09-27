#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

function transformExpectedScoreRange(inputFile, outputFile) {
  console.log(`Transforming ${inputFile}...`);
  
  const data = JSON.parse(readFileSync(inputFile, 'utf8'));
  
  // Transform each result
  data.results = data.results.map(result => {
    if (result.expected_score_range) {
      // Convert expected_score_range to expected_score_band
      const [min, max] = result.expected_score_range;
      result.expected_score_band = {
        min,
        max,
        midpoint: (min + max) / 2
      };
      
      // Create expected field that validation script expects
      result.expected = {
        score_band: result.expected_score_range,
        checks: result.checks
      };
      
      // Remove the old field
      delete result.expected_score_range;
      
      // Remove validation field since it will be recomputed
      delete result.validation;
    }
    
    return result;
  });
  
  // Write the transformed data
  writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`Transformed data written to ${outputFile}`);
}

// Get command line arguments
const [,, inputFile, outputFile] = process.argv;

if (!inputFile || !outputFile) {
  console.error('Usage: node scripts/fix_expected_data.mjs <input-file> <output-file>');
  process.exit(1);
}

transformExpectedScoreRange(inputFile, outputFile);