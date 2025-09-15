// Background script for OnboardingAudit.ai extension
// Implements deterministic handshake pattern for reliable communication

import { backgroundLogger as logger } from '../shared/logger';
import { RULES_TIMEOUT_MS } from '../config';
import { RULES_V11_FALLBACK } from '@onboarding-audit/core/rules/defaults';

chrome.runtime.onInstalled.addListener(() => {
  logger.ok('OnboardingAudit.ai extension installed');
});

async function fetchRules() {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), RULES_TIMEOUT_MS);
  try {
    const url = `${(self as any).API_BASE_URL || ''}/api/v1/rules`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error('rules http ' + res.status);
    const data = await res.json();
    await chrome.storage.session.set({ onbrd_rules: data });
  } catch {
    await chrome.storage.session.set({ onbrd_rules: RULES_V11_FALLBACK });
  }
}

self.addEventListener('activate', (e: any) => { e.waitUntil(fetchRules()); });

// Message handler for deterministic handshake
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  logger.start(`Background script received message: ${JSON.stringify(request)}`);
  
  // Handle RUN_AUDIT from popup - main handshake flow
  if (request.type === 'RUN_AUDIT') {
    handleDeterministicHandshake(sendResponse);
    return true; // Keep message channel open for async response
  }
  
  return false; // No other message types handled here
});

/**
 * Implements deterministic handshake pattern:
 * 1. Inject content script
 * 2. PING content script (1000ms timeout)
 * 3. If no response, re-inject and PING again
 * 4. Send RUN_AUDIT to content script (3000ms timeout)
 * 5. Return result to popup
 */
async function handleDeterministicHandshake(sendResponse: (response: any) => void) {
  try {
    logger.start('Starting deterministic handshake...');
    
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      throw new Error('No active tab found');
    }
    
    logger.ok(`Active tab found: ${tab.id}, ${tab.url}`);
    
    // Step 1: Inject content script
    await injectContentScript(tab.id);
    
    // Step 2: PING content script with timeout and retry logic
    const pingSuccess = await pingContentScriptWithRetry(tab.id);
    if (!pingSuccess) {
      throw new Error('Content script not responding to PING after retry');
    }
    
    // Step 3: Send RUN_AUDIT and wait for response
    const auditResult = await sendRunAuditWithTimeout(tab.id);
    
    // Step 4: Return result to popup
    logger.ok(`Audit completed successfully: ${JSON.stringify(auditResult)}`);
    sendResponse({ success: true, data: auditResult });
    
  } catch (error) {
    logger.error(`Deterministic handshake failed: ${error instanceof Error ? error.message : String(error)}`);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Audit failed'
    });
  }
}

/**
 * Inject content script programmatically
 */
async function injectContentScript(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['assets/content.js']
    });
    logger.ok('Content script injected successfully');
  } catch (error) {
    throw new Error(`Failed to inject content script: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * PING content script with retry logic
 * Returns true if PING succeeds, false if both attempts fail
 */
async function pingContentScriptWithRetry(tabId: number): Promise<boolean> {
  // First attempt
  const firstPing = await pingContentScript(tabId);
  if (firstPing) {
    return true;
  }
  
  logger.error('First PING attempt failed, retrying...');
  
  // Re-inject and try again
  try {
    await injectContentScript(tabId);
  } catch (error) {
    logger.error(`Failed to re-inject content script: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
  
  // Second attempt
  const secondPing = await pingContentScript(tabId);
  return secondPing;
}

/**
 * Send PING to content script with 1000ms timeout
 * Returns true if content responds with { ok: true }, false otherwise
 */
async function pingContentScript(tabId: number): Promise<boolean> {
  try {
    const response = await Promise.race([
      chrome.tabs.sendMessage(tabId, { type: 'PING' }),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('PING timeout')), 1000)
      )
    ]);
    
    if (response && typeof response === 'object' && 'ok' in response && response.ok === true) {
      logger.ok('PING successful - content script is responsive');
      return true;
    } else {
      logger.error(`PING response invalid: ${JSON.stringify(response)}`);
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'PING timeout') {
      logger.error('PING timeout - content script not responding within 1000ms');
    } else {
      logger.error(`PING failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    return false;
  }
}

/**
 * Send RUN_AUDIT to content script with 3000ms timeout
 * Returns the audit data on success, throws on failure
 */
async function sendRunAuditWithTimeout(tabId: number): Promise<any> {
  try {
    const response = await Promise.race([
      chrome.tabs.sendMessage(tabId, { type: 'RUN_AUDIT' }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('RUN_AUDIT timeout')), 3000)
      )
    ]);
    
    if (response && typeof response === 'object' && 'ok' in response && response.ok === true && 'data' in response) {
      logger.ok('RUN_AUDIT successful - audit data received');
      return response.data;
    } else if (response && typeof response === 'object' && 'error' in response) {
      throw new Error(`Content script error: ${response.error}`);
    } else {
      throw new Error(`Invalid RUN_AUDIT response: ${JSON.stringify(response)}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'RUN_AUDIT timeout') {
      throw new Error('RUN_AUDIT timeout - content script not responding within 3000ms');
    }
    throw error;
  }
}
