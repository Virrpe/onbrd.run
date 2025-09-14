// Content script entry point for programmatic injection
// This file serves as the entry point that will be emitted as assets/content.js
// and injected programmatically by the background script

import { performAudit } from '@core/probes';
import { contentLogger as logger } from '../shared/logger';

// Extend Window interface for our custom properties
declare global {
  interface Window {
    __onboardingAuditInjected?: boolean;
    __OA_READY__: boolean;
  }
}

// MutationObserver for SPA support (debounced)
let mutationTimeout: number | null = null;
const observer = new MutationObserver(() => {
  if (mutationTimeout) clearTimeout(mutationTimeout);
  mutationTimeout = window.setTimeout(() => {
    logger.ok('SPA content change detected, ready for re-audit');
  }, 1000); // 1 second debounce
});

// Start observing when DOM is ready
function startObserving() {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  logger.ok('OnboardingAudit.ai MutationObserver started for SPA support');
}

// Network idle detection with fallback timeout
async function waitForNetworkIdle(timeout = 1500): Promise<void> {
  return new Promise((resolve) => {
    let timeoutId: number;
    let requestCount = 0;
    
    // Track network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      requestCount++;
      clearTimeout(timeoutId);
      try {
        const result = await originalFetch(...args);
        requestCount--;
        if (requestCount === 0) {
          timeoutId = window.setTimeout(resolve, 500); // 500ms after last request
        }
        return result;
      } catch (error) {
        requestCount--;
        if (requestCount === 0) {
          timeoutId = window.setTimeout(resolve, 500);
        }
        throw error;
      }
    };
    
    // Fallback timeout
    timeoutId = window.setTimeout(() => {
      window.fetch = originalFetch; // Restore original fetch
      resolve();
    }, timeout);
  });
}

// Main audit function with network idle wait
async function runAuditWithNetworkIdle(sendResponse: (response: any) => void) {
  try {
    logger.start('Starting audit with network idle detection...');
    
    // Wait for network idle or timeout
    await waitForNetworkIdle(1500);
    logger.ok('Network idle detected or timeout reached, proceeding with audit');
    
    // Perform the audit
    const audit = performAudit();
    
    // Add metadata about the audit conditions
    const enhancedAudit = {
      ...audit,
      metadata: {
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        extension_version: '1.0.0',
        network_idle: true,
        spa_support: true
      }
    };
    
    sendResponse({ ok: true, data: enhancedAudit });
  } catch (error) {
    logger.error(`Audit failed: ${error instanceof Error ? error.message : String(error)}`);
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Set window ready flag and log on load
window.__OA_READY__ = true;
logger.ok('READY');

// Prevent duplicate injection
if (window.__onboardingAuditInjected) {
  logger.ok('OnboardingAudit.ai content script already injected, skipping');
} else {
  window.__onboardingAuditInjected = true;
  
  // Content script message handler for deterministic handshake
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    logger.start(`Content script received message: ${JSON.stringify(request)}`);
    
    // Handle PING from background script - part of deterministic handshake
    if (request.type === 'PING') {
      logger.ok('PING received - content script is responsive');
      sendResponse({ ok: true, ts: Date.now() });
      return true; // Keep message channel open
    }
    
    // Handle RUN_AUDIT from background script - main audit flow
    if (request.type === 'RUN_AUDIT') {
      runAuditWithNetworkIdle(sendResponse);
      return true; // Keep message channel open for async response
    }
    
    return false; // No other message types handled
  });
  
  // Initialize content script
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      logger.ok('OnboardingAudit.ai content script loaded via programmatic injection');
      startObserving();
    });
  } else {
    logger.ok('OnboardingAudit.ai content script loaded via programmatic injection');
    startObserving();
  }
  
  // Handle page visibility changes for SPAs
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      logger.ok('Page became visible, ready for audit');
    }
  });
}