/**
 * Simple test to demonstrate logger usage
 * This file can be used to verify the logger works correctly
 */

import { createLogger, popupLogger, backgroundLogger, contentLogger } from './logger';

// Test basic logger creation and usage
function testLogger() {
  console.log('=== Testing OnboardingAudit.ai Logger ===');
  
  // Test creating a custom logger
  const testLogger = createLogger('POPUP');
  
  // Test all log levels
  testLogger.start('This is a START log message');
  testLogger.ok('This is an OK log message');
  testLogger.error('This is an ERROR log message');
  
  // Test pre-configured loggers
  popupLogger.start('Popup logger test');
  backgroundLogger.ok('Background logger test');
  contentLogger.error('Content logger test');
  
  console.log('=== Logger test completed ===');
}

// Export for use in other modules
export { testLogger };