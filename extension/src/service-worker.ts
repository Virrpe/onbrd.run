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