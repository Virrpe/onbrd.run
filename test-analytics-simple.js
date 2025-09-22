const fs = require('fs');
const path = require('path');

console.log('Testing analytics functionality...');

// Check if analytics.ts exists and has the right exports
const analyticsPath = path.join(__dirname, 'site/lib/analytics.ts');
if (fs.existsSync(analyticsPath)) {
  console.log('✅ analytics.ts file exists');
  
  const content = fs.readFileSync(analyticsPath, 'utf8');
  
  // Check for required exports
  const requiredExports = ['track', 'EVENT_NAMES', 'getEvents', 'clearEvents'];
  const missingExports = requiredExports.filter(exp => !content.includes(`export.*${exp}`));
  
  if (missingExports.length === 0) {
    console.log('✅ All required exports found');
  } else {
    console.log('❌ Missing exports:', missingExports);
  }
  
  // Check for event names
  const eventNames = ['LP_VIEW', 'DEMO_CLICK', 'AUDIT_START', 'SIGNUP_START', 'SIGNUP_SUCCESS', 'EXPORT_CLICK'];
  const missingEvents = eventNames.filter(name => !content.includes(name));
  
  if (missingEvents.length === 0) {
    console.log('✅ All required event names found');
  } else {
    console.log('❌ Missing event names:', missingEvents);
  }
  
  // Check for feature flag integration
  if (content.includes('ANALYTICS_EVENTS')) {
    console.log('✅ Feature flag integration found');
  } else {
    console.log('❌ Feature flag integration missing');
  }
  
} else {
  console.log('❌ analytics.ts file not found');
}

// Check if featureFlags.ts exists
const featureFlagsPath = path.join(__dirname, 'site/lib/featureFlags.ts');
if (fs.existsSync(featureFlagsPath)) {
  console.log('✅ featureFlags.ts file exists');
  
  const content = fs.readFileSync(featureFlagsPath, 'utf8');
  if (content.includes('ANALYTICS_EVENTS')) {
    console.log('✅ ANALYTICS_EVENTS feature flag found');
  } else {
    console.log('❌ ANALYTICS_EVENTS feature flag missing');
  }
} else {
  console.log('❌ featureFlags.ts file not found');
}

// Check if HTML files have analytics tracking
const indexPath = path.join(__dirname, 'site/index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes('analytics-probe')) {
    console.log('✅ Landing page has analytics tracking');
  } else {
    console.log('❌ Landing page missing analytics tracking');
  }
}

const demoPath = path.join(__dirname, 'site/demo/index.html');
if (fs.existsSync(demoPath)) {
  const content = fs.readFileSync(demoPath, 'utf8');
  if (content.includes('analytics-probe')) {
    console.log('✅ Demo page has analytics tracking');
  } else {
    console.log('❌ Demo page missing analytics tracking');
  }
}

// Check extension popup
const popupPath = path.join(__dirname, 'extension/src/popup/App.svelte');
if (fs.existsSync(popupPath)) {
  const content = fs.readFileSync(popupPath, 'utf8');
  if (content.includes('analytics-probe')) {
    console.log('✅ Extension popup has analytics tracking');
  } else {
    console.log('❌ Extension popup missing analytics tracking');
  }
}

console.log('Analytics functionality test complete!');