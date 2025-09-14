import { performAudit } from '@core/probes';
import { contentLogger as logger } from '../shared/logger';

// Type declaration for window property
declare global {
  interface Window {
    __OA_READY__: boolean;
  }
}

// Set window ready flag and log on load
window.__OA_READY__ = true;
logger.ok('READY');

// Timeout utility function
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
}

// Content script message handler
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  logger.start(`Received message: ${request.type}`);
  
  // PING handler - respond with timestamp
  if (request.type === 'PING') {
    sendResponse({ ok: true, ts: Date.now() });
    return true; // Keep channel open for async response
  }
  
  // RUN_AUDIT handler - perform audit with timeout protection
  if (request.type === 'RUN_AUDIT') {
    // Run audit with timeout protection (2000ms cap)
    Promise.race([performAudit(), timeout(2000)])
      .then((audit) => {
        logger.ok('Audit completed successfully');
        sendResponse({ ok: true, data: audit });
      })
      .catch((error) => {
        logger.error(`Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        sendResponse({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' });
      })
      .finally(() => {
        // Ensure response is sent even if something goes wrong
        logger.ok('Audit request completed');
      });
    
    return true; // Keep channel open for async response
  }
  
  // Unknown message type
  logger.error(`Unknown message type: ${request.type}`);
  sendResponse({ ok: false, error: `Unknown message type: ${request.type}` });
  return true;
});