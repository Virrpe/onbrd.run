#!/usr/bin/env node
import fs from 'node:fs/promises';

const files = [
  'benchmarks/results.train.none.json',
  'benchmarks/results.train.light.json', 
  'benchmarks/results.holdout.none.json'
];

// Function to generate reasonable expected checks based on score range
function generateExpectedChecks(score, expectedRange) {
  const [minScore, maxScore] = expectedRange;
  const expectedScore = (minScore + maxScore) / 2;
  
  // Generate expected checks based on expected score
  // Higher scores should have more positive checks
  const expectedChecks = {
    "h_cta_above_fold": expectedScore >= 70, // Good designs have CTA above fold
    "h_steps_count": expectedScore >= 60,    // Reasonable step count
    "h_copy_clarity": expectedScore >= 65,   // Good copy clarity
    "h_trust_markers": expectedScore >= 75,  // High trust for high scores
    "h_perceived_signup_speed": expectedScore >= 60 // Reasonable signup speed
  };
  
  return expectedChecks;
}

for (const file of files) {
  try {
    const resultsRaw = await fs.readFile(file, 'utf8');
    const resultsData = JSON.parse(resultsRaw);

    // Add expected data to each result
    resultsData.results = resultsData.results.map(result => {
      const expectedChecks = generateExpectedChecks(result.score, result.expected_score_range);
      
      return {
        ...result,
        expected: {
          checks: expectedChecks,
          score_band: result.expected_score_range
        }
      };
    });

    // Write back the updated results
    await fs.writeFile(file, JSON.stringify(resultsData, null, 2) + '\n');
    console.log(`Added expected data to ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}