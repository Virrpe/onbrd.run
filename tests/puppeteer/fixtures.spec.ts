import path from "path";
import fs from "fs";
import http from "http";
import puppeteer, { Page } from "puppeteer";

const FIX_ROOT = path.resolve(__dirname, "../fixtures/www");
const DIST_CONTENT = path.resolve(__dirname, "../../extension/dist/assets/content.js");

function startServer(root: string, port = 4000) {
  return new Promise<http.Server>((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url || "/", `http://127.0.0.1:${port}`);
      let f = path.join(root, decodeURIComponent(u.pathname));
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
      if (!fs.existsSync(f)) { res.statusCode = 404; return void res.end("not found"); }
      res.setHeader("content-type", f.endsWith(".html") ? "text/html" : "text/plain");
      res.end(fs.readFileSync(f));
    }).listen(port, () => resolve(srv));
  });
}

async function injectIIFE(page: Page, code: string) {
  await page.addScriptTag({ content: code });
}

(async () => {
  if (!fs.existsSync(DIST_CONTENT)) {
    console.error("Missing built content bundle:", DIST_CONTENT);
    process.exit(1);
  }
  const code = fs.readFileSync(DIST_CONTENT, "utf8");

  if (!fs.existsSync(FIX_ROOT)) {
    console.error("Missing fixtures root:", FIX_ROOT);
    process.exit(1);
  }

  const server = await startServer(FIX_ROOT, 4000);
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

  const cases = [
    { id: "A-CTA-ABOVE-FOLD", pass: "/A-CTA-ABOVE-FOLD.pass.html", fail: "/A-CTA-ABOVE-FOLD.fail.html" },
    { id: "F-ACCESSIBILITY-FOCUS", pass: "/F-ACCESSIBILITY-FOCUS.pass.html", fail: "/F-ACCESSIBILITY-FOCUS.fail.html" },
    { id: "F-MOBILE-RESPONSIVE", pass: "/F-MOBILE-RESPONSIVE.pass.html", fail: "/F-MOBILE-RESPONSIVE.fail.html" }
  ];

  for (const c of cases) {
    let passScore = 0, failScore = 0;

    { // PASS page
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:4000${c.pass}`);
      await injectIIFE(page, code);
      const audit: any = await page.evaluate(() => (window as any).__ONBRD_LAST_AUDIT || null);
      if (!audit) { console.error("No audit result for", c.id, "pass"); process.exit(1); }
      passScore = Number(audit.score || 0);
      await page.close();
    }
    { // FAIL page
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:4000${c.fail}`);
      await injectIIFE(page, code);
      const audit: any = await page.evaluate(() => (window as any).__ONBRD_LAST_AUDIT || null);
      if (!audit) { console.error("No audit result for", c.id, "fail"); process.exit(1); }
      failScore = Number(audit.score || 0);
      await page.close();
    }

    if (!(passScore > failScore)) {
      console.error(`Score invariant violated for ${c.id}: pass(${passScore}) <= fail(${failScore})`);
      process.exit(1);
    } else {
      console.log(`[fixtures] ${c.id}: pass(${passScore}) > fail(${failScore}) ✓`);
    }
  }

  await browser.close();
  server.close();
  console.log("[fixtures] PASS");
})().catch(e => { console.error(e); process.exit(1); });