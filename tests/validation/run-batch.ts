import fs from "fs";
import path from "path";
import http from "http";
import puppeteer from "puppeteer";

const DIST_CONTENT = path.resolve("extension/dist/assets/content.js");
const CORPUS = path.resolve("tests/validation/corpus");
const GOLDENS = path.resolve("tests/validation/goldens.json");
const OUT = path.resolve("tests/validation/out");

type RuleHit = { id: string; passed: boolean; weight?: number; category?: string };
type Audit = {
  score: number;
  rules?: RuleHit[];
  categories?: Record<string, number>;
};

interface AuditResponse {
  ok: boolean;
  data?: Audit;
  error?: string;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
};

function serve(root: string, port: number) {
  return new Promise<http.Server>((resolve) => {
    const srv = http
      .createServer((req, res) => {
        const u = new URL(req.url || "/", `http://127.0.0.1:${port}`);
        let f = path.join(root, decodeURIComponent(u.pathname).replace(/^\//, ''));
        
        // Skip favicon requests and log requests
        if (u.pathname === '/favicon.ico') {
          res.statusCode = 204; // No content
          return void res.end();
        }
        
        if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
          f = path.join(f, "index.html");
        }
        if (!fs.existsSync(f)) {
          res.statusCode = 404;
          return void res.end("nf");
        }
        const ext = path.extname(f).toLowerCase();
        res.setHeader("content-type", MIME[ext] || "application/octet-stream");
        res.end(fs.readFileSync(f));
      })
      .listen(port, () => resolve(srv));
  });
}

async function run() {
  if (!fs.existsSync(DIST_CONTENT)) {
    console.error("Missing bundle:", DIST_CONTENT);
    process.exit(1);
  }
  const code = fs.readFileSync(DIST_CONTENT, "utf8");

  const goldens = fs.existsSync(GOLDENS)
    ? (JSON.parse(fs.readFileSync(GOLDENS, "utf8")) as Record<
        string,
        { expectPass?: string[]; expectFail?: string[] }
      >)
    : {};

  fs.mkdirSync(OUT, { recursive: true });
  const outJsonl = path.join(OUT, "results.jsonl");
  fs.writeFileSync(outJsonl, "");

  // Ensure corpus dirs exist
  const fixturesRoot = path.join(CORPUS, "fixtures");
  const snapshotsRoot = path.join(CORPUS, "snapshots");
  fs.mkdirSync(fixturesRoot, { recursive: true });
  fs.mkdirSync(snapshotsRoot, { recursive: true });

  // Serve fixtures and snapshots
  const srvA = await serve(fixturesRoot, 4201);
  const srvB = await serve(snapshotsRoot, 4202);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const pages: Array<{ label: string; url: string }> = [];
  for (const f of fs.readdirSync(fixturesRoot)) {
    if (f.endsWith(".html")) pages.push({ label: `fixtures/${f}`, url: `http://127.0.0.1:4201/${f}` });
  }
  if (fs.existsSync(snapshotsRoot)) {
    for (const f of fs.readdirSync(snapshotsRoot)) {
      if (f.endsWith(".html")) pages.push({ label: `snapshots/${f}`, url: `http://127.0.0.1:4202/${f}` });
    }
  }

  // Utility function to calculate standard deviation
  function calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squareDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(variance);
  }

  let hasStabilityIssues = false;

  for (const p of pages) {
    const runResults: Array<{audit: Audit | null, consoleLogs: string[], reqFails: string[]}> = [];
    
    // Run each fixture 3 times with 100ms delay between runs
    for (let run = 0; run < 3; run++) {
      const page = await browser.newPage();
      const consoleLogs: string[] = [];
      const reqFails: string[] = [];
      page.on("console", (msg) => {
        const logMsg = `[${msg.type()}] ${msg.text()}`;
        consoleLogs.push(logMsg);
        console.log(`Page console (${p.label}, run ${run + 1}): ${logMsg}`);
      });
      page.on("requestfailed", (r) => {
        const failMsg = `${r.method()} ${r.url()} ${r.failure()?.errorText || ""}`;
        reqFails.push(failMsg);
        console.error(`Request failed (${p.label}, run ${run + 1}): ${failMsg}`);
      });

      await page.goto(p.url, { waitUntil: "domcontentloaded" });
      
      // Add mock chrome object and define __name before injecting content script
      await page.evaluate(`(() => {
        console.log('Setting up mock chrome object for validation');
        // Define __name function that content script expects
        if (typeof window.__name === 'undefined') {
          window.__name = function(target, value) {
            Object.defineProperty(target, "name", { value, configurable: true });
          };
        }
        // Mock chrome runtime for message listening
        window.chrome = {
          runtime: {
            onMessage: {
              addListener: function(listener) {
                console.log('Message listener captured and stored in __oaListener');
                window.__oaListener = listener;
              }
            }
          }
        };
        // Set validation mode flag to skip network idle waiting
        window.__OA_VALIDATION_MODE__ = true;
        console.log('Mock chrome setup complete, validation mode enabled');
      })()`);

      // Inject the content script bundle (IIFE)
      await page.addScriptTag({ content: code });
      console.log(`Content script injected for ${p.label}, run ${run + 1}`);

      // Wait for the content script to be ready and listener to be set
      await page.waitForFunction(() => {
        const ready = (window as any).__OA_READY__ === true;
        const listenerSet = (window as any).__oaListener !== undefined;
        if (ready && listenerSet) {
          console.log('Content script ready and listener set');
        }
        return ready && listenerSet;
      }, { timeout: 10000 });

      // Try to run audit using the direct function if available, otherwise use message listener
      let auditResponse: any;
      try {
        auditResponse = await page.evaluate(async () => {
          try {
            // First try the direct function
            if (typeof (window as any).__OA_RUN_AUDIT === 'function') {
              console.log('Using direct __OA_RUN_AUDIT function');
              return await (window as any).__OA_RUN_AUDIT();
            }
            
            // Fallback to message listener
            const listener = (window as any).__oaListener;
            if (!listener) {
              throw new Error('Neither __OA_RUN_AUDIT function nor message listener found');
            }
            
            console.log('Falling back to message listener with RUN_AUDIT');
            return new Promise((resolve) => {
              const message = { type: 'RUN_AUDIT' };
              const sender = null;
              const sendResponse = (response: any) => {
                console.log('Audit response received:', response);
                resolve(response);
              };
              
              // Add a timeout to prevent hanging
              setTimeout(() => {
                console.log('Timeout waiting for audit response');
                resolve({ ok: false, error: 'Timeout waiting for audit response' });
              }, 10000);
              
              listener(message, sender, sendResponse);
            });
          } catch (error) {
            console.error('Error in audit evaluation:', error);
            return { ok: false, error: String(error) };
          }
        });
      } catch (e) {
        console.error(`Page evaluation failed for ${p.label}, run ${run + 1}:`, e);
        auditResponse = { ok: false, error: `Evaluation error: ${String(e)}` };
      }

      let audit: Audit | null = null;
      const response = auditResponse as AuditResponse;
      if (response.ok && response.data) {
        audit = response.data;
      } else {
        console.error(`Audit failed for ${p.label}, run ${run + 1}: ${response.error || 'No data'}`);
      }

      runResults.push({ audit, consoleLogs, reqFails });
      await page.close();

      // Add 100ms delay between runs, except after the last run
      if (run < 2) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Aggregate results from 3 runs
    const successfulRuns = runResults.filter(r => r.audit !== null);
    const scores = successfulRuns.map(r => r.audit!.score);
    const scoreVariance = calculateStdDev(scores);
    
    // Calculate rule variances and track flips
    const ruleVariance: Record<string, number> = {};
    const ruleFlips: string[] = [];
    
    if (successfulRuns.length > 0) {
      const ruleIds = successfulRuns[0].audit!.rules?.map(r => r.id) || [];
      
      for (const ruleId of ruleIds) {
        const ruleScores = successfulRuns.map(r => {
          const rule = r.audit!.rules?.find(rule => rule.id === ruleId);
          return rule ? (rule.passed ? 1 : 0) : 0;
        });
        ruleVariance[ruleId] = calculateStdDev(ruleScores);
        
        // Check for rule flips (state changes between runs)
        const ruleStates = successfulRuns.map(r => {
          const rule = r.audit!.rules?.find(rule => rule.id === ruleId);
          return rule ? rule.passed : false;
        });
        
        const hasFlip = ruleStates.some((state, i) =>
          i > 0 && state !== ruleStates[i - 1]
        );
        
        if (hasFlip) {
          ruleFlips.push(ruleId);
        }
      }
    }

    // Check failure conditions
    if (scoreVariance > 1) {
      console.error(`STABILITY ISSUE: Score variance > 1 for ${p.label}: ${scoreVariance.toFixed(2)}`);
      hasStabilityIssues = true;
    }
    
    if (ruleFlips.length > 0) {
      console.error(`STABILITY ISSUE: Rule flips detected for ${p.label}: ${ruleFlips.join(', ')}`);
      hasStabilityIssues = true;
    }

    // Use the last successful run for the main record (maintains existing behavior)
    const lastSuccessfulRun = successfulRuns[successfulRuns.length - 1] || runResults[runResults.length - 1];
    const audit = lastSuccessfulRun?.audit || null;
    const consoleLogs = lastSuccessfulRun?.consoleLogs || [];
    const reqFails = lastSuccessfulRun?.reqFails || [];

    const rec: any = {
      page: p.label,
      url: p.url,
      ok: !!audit,
      score: audit?.score ?? null,
      rules: audit?.rules ?? [],
      logs: consoleLogs.slice(0, 5),
      failedRequests: reqFails.slice(0, 5),
      // Add stability metrics
      score_variance: scoreVariance,
      rule_variance: ruleVariance,
      rule_flips: ruleFlips,
      run_count: successfulRuns.length
    };

    // Golden checks only for fixtures
    const fname = path.basename(p.label);
    const g = goldens[fname];
    if (g && audit?.rules) {
      const passed = new Set(audit.rules.filter((r) => r.passed).map((r) => r.id));
      const failed = new Set(audit.rules.filter((r) => !r.passed).map((r) => r.id));
      rec.golden = {
        expectPass: g.expectPass || [],
        expectFail: g.expectFail || [],
        passOk: (g.expectPass || []).every((id: string) => passed.has(id)),
        failOk: (g.expectFail || []).every((id: string) => failed.has(id)),
      };
    }

    fs.appendFileSync(outJsonl, JSON.stringify(rec) + "\n");
  }

  await browser.close();
  srvA.close();
  srvB.close();
  console.log("[validation] Wrote", outJsonl);

  // Exit with non-zero code if stability issues were detected
  if (hasStabilityIssues) {
    console.error("Validation failed due to stability issues (score variance > 1 or rule flips)");
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});