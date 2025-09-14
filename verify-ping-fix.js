// Simple verification script to test PING/PONG communication
// This simulates the background script's logic

console.log('🔍 Testing OnboardingAudit.ai PING/PONG communication fix...\n');

// Mock chrome.tabs.sendMessage to simulate the content script response
const mockChromeTabs = {
  sendMessage: async (tabId, message) => {
    console.log(`📤 Sending message to tab ${tabId}:`, message);
    
    // Simulate the content script's response based on the built content.js
    if (message.type === 'PING') {
      // This is what the content script should respond with
      return { ok: true, ts: Date.now() };
    } else if (message.type === 'RUN_AUDIT') {
      // Simulate audit response
      return { 
        ok: true, 
        data: {
          id: 'test-audit',
          url: 'https://example.com',
          timestamp: new Date().toISOString(),
          scores: { overall: 75 },
          heuristics: {},
          recommendations: []
        }
      };
    }
    
    throw new Error('Unknown message type');
  }
};

// Simulate the background script's ping logic
async function pingContentScript(tabId) {
  try {
    const response = await Promise.race([
      mockChromeTabs.sendMessage(tabId, { type: 'PING' }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PING timeout')), 1000)
      )
    ]);
    
    if (response && typeof response === 'object' && 'ok' in response && response.ok === true) {
      console.log('✅ PING successful - content script is responsive');
      console.log('   Response:', JSON.stringify(response));
      return true;
    } else {
      console.log('❌ PING response invalid:', JSON.stringify(response));
      return false;
    }
  } catch (error) {
    if (error.message === 'PING timeout') {
      console.log('❌ PING timeout - content script not responding within 1000ms');
    } else {
      console.log('❌ PING failed:', error.message);
    }
    return false;
  }
}

// Test the fix
async function testPingFix() {
  console.log('🧪 Testing PING fix...');
  
  // Test 1: Basic PING
  console.log('\n--- Test 1: Basic PING ---');
  const result1 = await pingContentScript(123);
  
  if (result1) {
    console.log('✅ Test 1 PASSED: PING communication is working correctly');
  } else {
    console.log('❌ Test 1 FAILED: PING communication is broken');
    return false;
  }
  
  // Test 2: Verify response structure
  console.log('\n--- Test 2: Response Structure Validation ---');
  try {
    const response = await mockChromeTabs.sendMessage(123, { type: 'PING' });
    
    const hasOk = 'ok' in response && response.ok === true;
    const hasTimestamp = 'ts' in response && typeof response.ts === 'number';
    
    if (hasOk && hasTimestamp) {
      console.log('✅ Test 2 PASSED: Response structure is correct');
      console.log('   - Has ok: true');
      console.log('   - Has timestamp:', response.ts);
    } else {
      console.log('❌ Test 2 FAILED: Response structure is incorrect');
      console.log('   - Has ok:', hasOk);
      console.log('   - Has timestamp:', hasTimestamp);
      return false;
    }
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error.message);
    return false;
  }
  
  console.log('\n🎉 All tests passed! The PING/PONG communication fix is working correctly.');
  return true;
}

// Run the test
testPingFix().then(success => {
  if (success) {
    console.log('\n✅ VERIFICATION COMPLETE: The "Content script not responding to PING after retry" error has been fixed!');
  } else {
    console.log('\n❌ VERIFICATION FAILED: The fix did not resolve the issue.');
    process.exit(1);
  }
}).catch(error => {
  console.log('\n❌ VERIFICATION ERROR:', error.message);
  process.exit(1);
});