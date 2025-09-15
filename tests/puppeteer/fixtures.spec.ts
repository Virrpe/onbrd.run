import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple HTTP server to serve fixture files
function createFixtureServer(port: number = 8080) {
  const server = createServer((req, res) => {
    try {
      const url = req.url || '/';
      const filePath = join(__dirname, '../fixtures/www', url === '/' ? 'good-performance.html' : url);
      
      if (filePath.endsWith('.html')) {
        const content = readFileSync(filePath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });

  return new Promise<{ server: any; url: string }>((resolve) => {
    server.listen(port, () => {
      resolve({ server, url: `http://localhost:${port}` });
    });
  });
}

interface AuditResult {
  score: number;
  metrics: Record<string, boolean>;
}

interface TestCase {
  name: string;
  path: string;
  expectedRules: {
    pass: string[];
    fail: string[];
  };
  expectedScoreRange: [number, number];
}

const testCases: TestCase[] = [
  {
    name: 'Good Performance Page',
    path: '/good-performance.html',
    expectedRules: {
      pass: ['F-PERFORMANCE-LCP', 'F-ACCESSIBILITY-FOCUS', 'F-MOBILE-RESPONSIVE'],
      fail: []
    },
    expectedScoreRange: [70, 100] // Should score well
  },
  {
    name: 'Bad Performance Page',
    path: '/bad-performance.html',
    expectedRules: {
      pass: [], // All should fail
      fail: ['F-PERFORMANCE-LCP', 'F-ACCESSIBILITY-FOCUS', 'F-MOBILE-RESPONSIVE']
    },
    expectedScoreRange: [0, 50] // Should score poorly
  }
];

async function runDirectAudit(page: any): Promise<AuditResult> {
  // Run the probes directly in the page context
  const auditResult = await page.evaluate(() => {
    const metrics: Record<string, boolean> = {};
    
    // F-PERFORMANCE-LCP: Simulate good performance (would normally use PerformanceObserver)
    metrics['F-PERFORMANCE-LCP'] = true;
    
    // F-ACCESSIBILITY-FOCUS: Check if focusable elements have visible focus indicators
    function probeA11yFocus() {
      const focusables = Array.from(document.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]'))
        .filter(el => {
          if (!(el as HTMLElement).matches?.('a,button,input,select,textarea,[tabindex]')) return false;
          const he = el as HTMLElement;
          return !he.hasAttribute('disabled') && he.tabIndex !== -1 && getComputedStyle(he).visibility !== 'hidden';
        });
      
      if (focusables.length === 0) return false;
      
      const offenders = focusables.filter(el => {
        const st = getComputedStyle(el);
        return st.outlineStyle === 'none' && st.outlineWidth === '0px';
      });
      
      return offenders.length === 0;
    }
    metrics['F-ACCESSIBILITY-FOCUS'] = probeA11yFocus();
    
    // F-MOBILE-RESPONSIVE: Check for viewport meta tag and mobile media queries
    function probeMobileResponsive() {
      const vp = document.querySelector('meta[name="viewport"]');
      const hasViewport = !!vp && (vp as HTMLMetaElement).content.includes('width=device-width');
      const styles = Array.from(document.querySelectorAll('style,link[rel="stylesheet"]'));
      const cssText = styles.map(n => (n as any).sheet?.ownerNode?.textContent || '').join('\n');
      const hasMedia = /@media\s*\(max-width:\s*(480|400)px\)/i.test(cssText);
      return hasViewport && hasMedia;
    }
    metrics['F-MOBILE-RESPONSIVE'] = probeMobileResponsive();
    
    // Calculate score based on rules (simplified version)
    const rules = [
      { id: 'F-PERFORMANCE-LCP', weight: 0.0727 },
      { id: 'F-ACCESSIBILITY-FOCUS', weight: 0.0545 },
      { id: 'F-MOBILE-RESPONSIVE', weight: 0.0455 }
    ];
    
    const sum = rules.reduce((acc, rule) => acc + (metrics[rule.id] ? rule.weight : 0), 0);
    const score = Math.round(sum * 100);
    
    return { score, metrics };
  });
  
  return auditResult;
}

async function runTestCase(browser: any, serverUrl: string, testCase: TestCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📄 Page: ${testCase.path}`);
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the test page
    await page.goto(`${serverUrl}${testCase.path}`, { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Wait for page to settle
    await page.waitForTimeout(2000);
    
    // Run the direct audit
    const auditResult = await runDirectAudit(page);
    
    console.log(`📊 Score: ${auditResult.score}`);
    console.log(`📋 Metrics:`, auditResult.metrics);
    
    // Validate score range
    const [minScore, maxScore] = testCase.expectedScoreRange;
    if (auditResult.score < minScore || auditResult.score > maxScore) {
      throw new Error(`Score ${auditResult.score} is outside expected range [${minScore}, ${maxScore}]`);
    }
    console.log(`✅ Score is within expected range [${minScore}, ${maxScore}]`);
    
    // Validate expected passing rules
    for (const ruleId of testCase.expectedRules.pass) {
      if (!auditResult.metrics[ruleId]) {
        throw new Error(`Expected rule ${ruleId} to PASS but it FAILED`);
      }
      console.log(`✅ Rule ${ruleId} passed as expected`);
    }
    
    // Validate expected failing rules
    for (const ruleId of testCase.expectedRules.fail) {
      if (auditResult.metrics[ruleId]) {
        throw new Error(`Expected rule ${ruleId} to FAIL but it PASSED`);
      }
      console.log(`✅ Rule ${ruleId} failed as expected`);
    }
    
    console.log(`✅ ${testCase.name} test passed!`);
    
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 Starting Puppeteer fixture tests...\n');
  
  let server: any;
  let browser: any;
  
  try {
    // Start the fixture server
    console.log('🌐 Starting fixture server...');
    const { server: fixtureServer, url: serverUrl } = await createFixtureServer();
    server = fixtureServer;
    console.log(`✅ Fixture server running at ${serverUrl}`);
    
    // Launch Puppeteer browser
    console.log('\n🌟 Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true, // Use headless for CI compatibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser launched');
    
    // Run test cases
    for (const testCase of testCases) {
      await runTestCase(browser, serverUrl, testCase);
    }
    
    console.log('\n✅ All Puppeteer fixture tests passed!');
    
  } catch (error) {
    console.error('\n❌ Puppeteer fixture tests failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
    
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
      console.log('\n🧹 Browser closed');
    }
    if (server) {
      server.close();
      console.log('🧹 Fixture server stopped');
    }
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { runDirectAudit, testCases };