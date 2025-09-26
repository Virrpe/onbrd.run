#!/usr/bin/env node

import { renderReport } from '../packages/report/src/index.ts';

// Mock audit data for testing
const mockAudit = {
  url: 'https://example.com',
  timestamp: new Date().toISOString(),
  scores: {
    overall: 75,
    h_cta_above_fold: 100,
    h_steps_count: 80,
    h_copy_clarity: 70,
    h_trust_markers: 60,
    h_perceived_signup_speed: 65
  },
  heuristics: {
    h_cta_above_fold: { detected: true },
    h_steps_count: { total: 4, forms: 2, screens: 2 },
    h_copy_clarity: { avg_sentence_length: 12, passive_voice_ratio: 8, jargon_density: 3 },
    h_trust_markers: { total: 2, testimonials: 1, security_badges: 1, customer_logos: 0 },
    h_perceived_signup_speed: { estimated_seconds: 45, form_fields: 5, required_fields: 3 }
  },
  recommendations: [
    {
      heuristic: 'h_trust_markers',
      priority: 'medium',
      description: 'Only 2 trust signals detected, which may reduce user confidence',
      fix: 'Add testimonials, security badges, or customer logos'
    },
    {
      heuristic: 'h_copy_clarity',
      priority: 'low',
      description: 'Average sentence length is 12 words, which may reduce comprehension',
      fix: 'Use shorter sentences, active voice, and plain language'
    }
  ],
  buildMetadata: {
    buildId: 'test-build-123',
    mode: 'local',
    rulesetHash: '5886d13f0c25f5a658228b4a4fc03616210264881133d52e5f08f9d552a785b0',
    rulesetVersion: '1.1.0'
  }
};

console.log('🧪 Testing report metadata integration...\n');

// Generate the report
const report = renderReport(mockAudit);

// Check if the footer contains the expected metadata
const footerMatch = report.match(/<footer[^>]*>([\s\S]*?)<\/footer>/);
if (footerMatch) {
  const footerContent = footerMatch[1];
  console.log('📄 Generated Footer:');
  console.log(footerContent);
  console.log('\n✅ Footer Analysis:');
  
  // Check for ruleset version
  if (footerContent.includes('v1.1.0')) {
    console.log('   ✅ Ruleset version found');
  } else {
    console.log('   ❌ Ruleset version missing');
  }
  
  // Check for ruleset hash (first 8 chars)
  if (footerContent.includes('5886d13f')) {
    console.log('   ✅ Ruleset hash found');
  } else {
    console.log('   ❌ Ruleset hash missing');
  }
  
  // Check for mode
  if (footerContent.includes('local')) {
    console.log('   ✅ Mode found');
  } else {
    console.log('   ❌ Mode missing');
  }
  
  // Check for timestamp
  if (footerContent.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)) {
    console.log('   ✅ Timestamp found');
  } else {
    console.log('   ❌ Timestamp missing');
  }
  
  // Check for hostname
  if (footerContent.includes('example.com')) {
    console.log('   ✅ Hostname found');
  } else {
    console.log('   ❌ Hostname missing');
  }
  
} else {
  console.log('❌ No footer found in report');
}

console.log('\n🎯 Test completed!');