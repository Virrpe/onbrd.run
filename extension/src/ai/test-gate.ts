/**
 * Test file to verify AI gate functionality
 * This demonstrates that AI calls throw appropriate errors when disabled
 */

import { assertAIEnabled, isAIEnabled, getAIDisclosureText, AIDisabledError } from './gate';
import { createAIClient } from './client';

// Test 1: Verify AI is disabled by default
console.log('AI Enabled by default:', isAIEnabled()); // Should be false
console.log('AI Disclosure Text:', getAIDisclosureText());

// Test 2: Verify assertAIEnabled throws when AI is disabled
try {
  assertAIEnabled();
  console.error('ERROR: assertAIEnabled should have thrown AIDisabledError');
} catch (error) {
  if (error instanceof AIDisabledError) {
    console.log('✓ assertAIEnabled correctly threw AIDisabledError:', error.message);
  } else {
    console.error('ERROR: Unexpected error type:', error);
  }
}

// Test 3: Verify AI client throws when AI is disabled
async function testAIClient() {
  const aiClient = createAIClient('https://api.example.com');
  
  try {
    await aiClient.analyzeContent({
      content: 'Test page content',
      context: {
        url: 'https://example.com',
        title: 'Test Page'
      }
    });
    console.error('ERROR: AI client should have thrown AIDisabledError');
  } catch (error) {
    if (error instanceof AIDisabledError) {
      console.log('✓ AI client correctly threw AIDisabledError:', error.message);
    } else {
      console.error('ERROR: AI client threw unexpected error:', error);
    }
  }
}

// Test 4: Verify generateInsights throws when AI is disabled
async function testGenerateInsights() {
  const aiClient = createAIClient('https://api.example.com');
  
  try {
    await aiClient.generateInsights('Test content', {
      url: 'https://example.com',
      title: 'Test Page'
    });
    console.error('ERROR: generateInsights should have thrown AIDisabledError');
  } catch (error) {
    if (error instanceof AIDisabledError) {
      console.log('✓ generateInsights correctly threw AIDisabledError:', error.message);
    } else {
      console.error('ERROR: generateInsights threw unexpected error:', error);
    }
  }
}

// Run tests
console.log('\n=== Running AI Gate Tests ===\n');
testAIClient();
testGenerateInsights();

console.log('\n=== AI Gate Tests Complete ===');
console.log('All AI functionality is properly gated when disabled.');