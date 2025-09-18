import { MAX_RETRY, RETRY_BACKOFF_MINUTES, API_BASE_URL, RULES_TIMEOUT_MS } from './config';

// persist ingest response for popup/report; add queue + flush on online
async function storeBenchmark(resp: {percentile: number, median: number, count: number}) {
  await chrome.storage.session.set({ onbrd_benchmark: resp });
}

async function enqueue(body: any) {
  const { onbrd_queue = [] } = await chrome.storage.local.get('onbrd_queue');
  onbrd_queue.push({ body, tries: 0, nextAt: Date.now() });
  await chrome.storage.local.set({ onbrd_queue });
}

async function flushQueue() {
  const { onbrd_queue = [] } = await chrome.storage.local.get('onbrd_queue');
  const now = Date.now();
  const next = [];
  
  for (const item of onbrd_queue) {
    if (item.nextAt > now) { 
      next.push(item); 
      continue; 
    }
    
    try {
      const r = await fetch(`${(self as any).API_BASE_URL || API_BASE_URL}/api/v1/ingest`, {
        method: 'POST', 
        headers: {'content-type': 'application/json'}, 
        body: JSON.stringify(item.body)
      });
      
      if (r.ok) {
        const data = await r.json();
        await storeBenchmark(data);
        continue;
      }
      throw new Error('http ' + r.status);
    } catch {
      item.tries++;
      const idx = Math.min(item.tries - 1, 5);
      const delayMin = RETRY_BACKOFF_MINUTES[idx];
      item.nextAt = Date.now() + delayMin * 60 * 1000;
      if (item.tries < MAX_RETRY) next.push(item);
    }
  }
  
  await chrome.storage.local.set({ onbrd_queue: next });
}

// Listen for online events and flush queue
self.addEventListener('online', () => { 
  flushQueue(); 
});

// Periodic queue flush every minute
setInterval(flushQueue, 60_000);

// Message handler for queue operations
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'ONBRD_ENQUEUE_INGEST') {
    enqueue(message.body).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (message?.type === 'ONBRD_FLUSH_QUEUE') {
    flushQueue().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
  
  if (message?.type === 'ONBRD_RUN_AUDIT_ACTIVE_TAB') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return sendResponse({ error: "No active tab" });

        // Your existing deterministic handshake function:
        // must resolve to an `audit` object (not undefined).
        const audit = await runAuditOnActiveTab();

        // OPTIONALLY include latest benchmark if present in session storage:
        const bench = await getSession("onbrd_benchmark"); // helper below

        sendResponse({ audit, benchmark: bench || undefined });
      } catch (e) {
        console.error("[SW] run_active_tab error", e);
        sendResponse({ error: (e as Error).message });
      }
    })();
    return true; // keep channel open
  }
  
  return false;
});

async function fetchConfig() {
  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(), RULES_TIMEOUT_MS);
  try {
    const url = `${(self as any).API_BASE_URL || API_BASE_URL}/api/v1/config`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      const cfg = await res.json();
      await chrome.storage.session.set({ onbrd_cfg: cfg });
    }
  } catch {/* ignore */}
}

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  flushQueue();
  fetchConfig();
});

chrome.runtime.onInstalled.addListener(() => {
  flushQueue();
  fetchConfig();
});

// Periodic config refresh every minute
setInterval(fetchConfig, 60_000);

// Audit functions for active tab
async function injectContentScript(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['assets/content.js']
    });
    console.log('Content script injected successfully');
  } catch (error) {
    throw new Error(`Failed to inject content script: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function pingContentScript(tabId: number): Promise<boolean> {
  try {
    const response = await Promise.race([
      chrome.tabs.sendMessage(tabId, { type: 'PING' }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('PING timeout')), 1000)
      )
    ]);
    
    if (response && typeof response === 'object' && 'ok' in response && response.ok === true) {
      console.log('PING successful - content script is responsive');
      return true;
    } else {
      console.error(`PING response invalid: ${JSON.stringify(response)}`);
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'PING timeout') {
      console.error('PING timeout - content script not responding within 1000ms');
    } else {
      console.error(`PING failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    return false;
  }
}

async function pingContentScriptWithRetry(tabId: number): Promise<boolean> {
  // First attempt
  const firstPing = await pingContentScript(tabId);
  if (firstPing) {
    return true;
  }
  
  console.error('First PING attempt failed, retrying...');
  
  // Re-inject and try again
  try {
    await injectContentScript(tabId);
  } catch (error) {
    console.error(`Failed to re-inject content script: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
  
  // Second attempt
  const secondPing = await pingContentScript(tabId);
  return secondPing;
}

async function sendRunAuditWithTimeout(tabId: number): Promise<any> {
  try {
    const response = await Promise.race([
      chrome.tabs.sendMessage(tabId, { type: 'RUN_AUDIT' }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('RUN_AUDIT timeout')), 3000)
      )
    ]);
    
    if (response && typeof response === 'object' && 'ok' in response && response.ok === true && 'data' in response) {
      console.log('RUN_AUDIT successful - audit data received');
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

async function runAuditOnActiveTab(): Promise<any> {
  try {
    console.log('Starting audit on active tab...');
    
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error('No active tab found');
    }
    
    console.log(`Active tab found: ${tab.id}, ${tab.url}`);
    
    // Step 1: Inject content script
    await injectContentScript(tab.id);
    
    // Step 2: PING content script with timeout and retry logic
    const pingSuccess = await pingContentScriptWithRetry(tab.id);
    if (!pingSuccess) {
      throw new Error('Content script not responding to PING after retry');
    }
    
    // Step 3: Send RUN_AUDIT and wait for response
    const auditResult = await sendRunAuditWithTimeout(tab.id);
    
    // Step 4: Return result
    console.log(`Audit completed successfully: ${JSON.stringify(auditResult)}`);
    return auditResult;
    
  } catch (error) {
    console.error(`Audit failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Safe Promise wrapper for storage get:
async function getSession<T = any>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    try {
      chrome.storage.session.get(key, (res) => resolve((res as any)?.[key]));
    } catch {
      resolve(undefined);
    }
  });
}