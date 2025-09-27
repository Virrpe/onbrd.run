#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WEIGHTS_PATH = join(__dirname, '../extension/src/scoring/weights.json');
const HASH_OUTPUT_PATH = join(__dirname, '../extension/src/scoring/weights.hash');

/**
 * Generate SHA256 hash of the weights.json file
 */
function generateWeightsHash() {
  try {
    // Read the weights.json file
    const weightsContent = readFileSync(WEIGHTS_PATH, 'utf8');
    
    // Parse and validate JSON (validation step)
    JSON.parse(weightsContent);
    
    // Generate SHA256 hash of the content
    const hash = createHash('sha256').update(weightsContent).digest('hex');
    
    // Write the hash to the output file
    writeFileSync(HASH_OUTPUT_PATH, hash, 'utf8');
    
    console.log(`✅ Generated weights hash: ${hash}`);
    console.log(`📁 Hash written to: ${HASH_OUTPUT_PATH}`);
    
    // Return hash for potential use in build process
    return hash;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Error: weights.json file not found at ${WEIGHTS_PATH}`);
      console.error('Please ensure the weights.json file exists before running this script.');
    } else if (error instanceof SyntaxError) {
      console.error(`❌ Error: Invalid JSON in weights.json file`);
      console.error(error.message);
    } else {
      console.error(`❌ Error generating weights hash: ${error.message}`);
    }
    process.exit(1);
  }
}

/**
 * Get weights metadata for build process
 */
function getWeightsMetadata() {
  try {
    const weightsContent = readFileSync(WEIGHTS_PATH, 'utf8');
    const weights = JSON.parse(weightsContent);
    const hash = createHash('sha256').update(weightsContent).digest('hex');
    
    return {
      version: weights.version,
      updatedAt: weights.updatedAt,
      hash: hash,
      ruleCount: weights.rules.length,
      categories: weights.categories
    };
  } catch (error) {
    console.error(`❌ Error reading weights metadata: ${error.message}`);
    return null;
  }
}

// Run the hash generation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateWeightsHash();
  
  // Also output metadata for build process
  const metadata = getWeightsMetadata();
  if (metadata) {
    console.log('\n📊 Weights Metadata:');
    console.log(`   Version: ${metadata.version}`);
    console.log(`   Updated: ${metadata.updatedAt}`);
    console.log(`   Rules: ${metadata.ruleCount}`);
    console.log(`   Categories: ${metadata.categories.join(', ')}`);
  }
}

export { generateWeightsHash, getWeightsMetadata };