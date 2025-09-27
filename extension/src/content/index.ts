import { USE_BACKEND, API_BASE_URL, INGEST_TIMEOUT_MS, LOCAL_ONLY, ALLOW_NETWORK } from '../config';
import { guardedFetch, NetworkDisabledError } from '../net/guard';
import { probeLCP } from '@onboarding-audit/core/probes/lcp';
import { probeA11yFocus } from '@onboarding-audit/core/probes/a11yFocus';
import { probeMobileResponsive } from '@onboarding-audit/core/probes/mobileResponsive';
import { makeEnv } from '../env';
import { calculateScore, generateAuditId } from '../scoring';

// Type declaration for window property
declare global {
  interface Window {
    __OA_READY__: boolean;
    __ONBRD_LAST_AUDIT__: any;
  }
}

// Set window ready flag and log on load
window.__OA_READY__ = true;
console.log('[Onbrd] Content script ready');

async function getRules() {
  const { onbrd_rules } = await chrome.storage.session.get('onbrd_rules');
  return onbrd_rules;
}


async function runAudit() {
  const rules = await getRules();
  // Create deterministic environment for scoring
  const env = makeEnv({ deterministic: true, seed: 12345 });
  
  // minimal metrics – add more probes as needed
  const metrics: Record<string, boolean> = {};
  metrics['F-PERFORMANCE-LCP']   = await probeLCP();
  metrics['F-ACCESSIBILITY-FOCUS']= probeA11yFocus().passed;
  metrics['F-MOBILE-RESPONSIVE'] = probeMobileResponsive();
  // other rule IDs default to heuristic checks you already have
  const scoringResult = calculateScore(rules.rules, metrics, env);

  // gate POST by telemetry_opt_in; message SW to enqueue when needed
  async function postIngest(body: any) {
    const { telemetry_opt_in } = await chrome.storage.sync.get('telemetry_opt_in');
    if (!telemetry_opt_in) return;
    
    // Check if network access is allowed before attempting fetch
    if (LOCAL_ONLY && !ALLOW_NETWORK) {
      console.log('[Onbrd] Network access disabled in local-only mode, skipping ingest');
      return;
    }
    
    try {
      const controller = new AbortController();
      setTimeout(()=>controller.abort(), INGEST_TIMEOUT_MS);
      const res = await guardedFetch(`${API_BASE_URL}/api/v1/ingest`, {
        method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body), signal: controller.signal
      });
      if (res.ok) {
        const data = await res.json();
        await chrome.storage.session.set({ onbrd_benchmark: data });
        return;
      }
      throw new Error('http '+res.status);
    } catch (error) {
      // Only enqueue if it's not a NetworkDisabledError
      if (!(error instanceof NetworkDisabledError)) {
        // ask SW to enqueue for retry
        chrome.runtime.sendMessage({ type:'ONBRD_ENQUEUE_INGEST', body });
      }
    }
  }

  // Send telemetry (fire-and-forget)
  if (USE_BACKEND) {
    const body = {
      audit_id: generateAuditId(env),
      url_hash: "", // let server compute if preferred; else pre-hash on client (avoid sending raw URL)
      score: scoringResult.score,
      metrics,
      user_agent: navigator.userAgent,
      created_at: new Date(env.clock.now()).toISOString()
    };
    postIngest(body);
  }

  // Expose result for popup
  (window as any).__ONBRD_LAST_AUDIT__ = {
    score: scoringResult.score,
    metrics,
    ts: env.clock.now(),
    passedRules: scoringResult.passedRules,
    failedRules: scoringResult.failedRules
  };
  return {
    score: scoringResult.score,
    metrics,
    passedRules: scoringResult.passedRules,
    failedRules: scoringResult.failedRules
  };
}

// Content script message handler
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log(`[Onbrd] Received message: ${request.type}`);
  
  // PING handler - respond with timestamp
  if (request.type === 'PING') {
    const env = makeEnv({ deterministic: true, seed: 12345 });
    sendResponse({ ok: true, ts: env.clock.now() });
    return true; // Keep channel open for async response
  }
  
  // RUN_AUDIT handler - perform audit with timeout protection
  if (request.type === 'RUN_AUDIT') {
    // Run audit with timeout protection (2000ms cap)
    Promise.race([runAudit(), new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out after 2000ms')), 2000))])
      .then((audit) => {
        console.log('[Onbrd] Audit completed successfully');
        sendResponse({ ok: true, data: audit });
      })
      .catch((error) => {
        console.error(`[Onbrd] Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        sendResponse({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' });
      })
      .finally(() => {
        // Ensure response is sent even if something goes wrong
        console.log('[Onbrd] Audit request completed');
      });
    
    return true; // Keep channel open for async response
  }

  // ONBRD_RUN_AUDIT handler - perform audit and return result directly
  if (request.type === 'ONBRD_RUN_AUDIT') {
    (async () => {
      try {
        const result = await runAudit();
        sendResponse(result || { error: "No audit result" });
      } catch (e) {
        console.error("[CS] RUN_AUDIT error", e);
        sendResponse({ error: (e as Error).message });
      }
    })();
    return true; // Keep channel open for async response
  }
  
  // Unknown message type
  console.error(`[Onbrd] Unknown message type: ${request.type}`);
  sendResponse({ ok: false, error: `Unknown message type: ${request.type}` });
  return true;
});

// When exporting, pass benchmark + rules into renderReport() input.
async function exportAuditHtml() {
  const { onbrd_rules } = await chrome.storage.session.get('onbrd_rules');
  const { onbrd_benchmark } = await chrome.storage.session.get('onbrd_benchmark');
  const host = location.hostname || 'page';
  const auditData = (window as any).__ONBRD_LAST_AUDIT__;
  
  if (!auditData) {
    console.error('[Onbrd] No audit data available for export');
    return;
  }
  
  // Create a simple HTML report with benchmark info
  const rules = onbrd_rules?.rules || [];
  const benchmark = onbrd_benchmark || {};
  const bmLine = benchmark.percentile != null
    ? `Top ${benchmark.percentile}% of ${benchmark.count} peers (median ${benchmark.median})`
    : `Benchmark unavailable (offline or consent off)`;
  
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Onbrd Report — ${host}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .header {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .score {
      font-size: 2em;
      font-weight: bold;
      color: #28a745;
    }
    .recommendation {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .priority-high {
      border-left: 4px solid #dc3545;
    }
    .priority-medium {
      border-left: 4px solid #ffc107;
    }
    .priority-low {
      border-left: 4px solid #28a745;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
  </style></head>
  <body>
    <header>
      <h1>Onboarding Audit — ${host}</h1>
      <div><strong>Score:</strong> ${auditData.score}</div>
      <div>${bmLine}</div>
      <div><small>Generated by OnboardingAudit.ai — v1.1.0 — ${new Date().toISOString()} — ${host}</small></div>
    </header>
    <section>
      <h2>Prioritized Fixes</h2>
      <ol>
        ${rules
          .filter((r: any) => !auditData.metrics[r.id])
          .sort((a: any, b: any) => b.weight - a.weight)
          .map((r: any) => `<li><strong>${r.id}</strong> — ${r.fix}${r.confidence && r.confidence !== 'high' ? ` <em>(confidence: ${r.confidence})</em>` : ''}</li>`)
          .join('')}
      </ol>
      <h2>Full Checklist</h2>
      <table>
        <thead><tr><th>Rule</th><th>Status</th><th>Weight</th><th>Fix</th></tr></thead>
        <tbody>
          ${rules.map((r: any) => `<tr>
            <td>${r.id}</td>
            <td>${auditData.metrics[r.id] ? '✅ Pass' : '❌ Fail'}</td>
            <td>${Math.round(r.weight * 100)}</td>
            <td>${r.fix}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </section>
  </body></html>`;
  
  // Create blob and download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const env = makeEnv({ deterministic: true, seed: 12345 });
  a.download = `onbrd-report-${host}-${env.clock.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'ONBRD_FLUSH_QUEUE') { /* optional */ }
  if (msg?.type === 'ONBRD_EXPORT_REPORT') {
    exportAuditHtml();
  }
});