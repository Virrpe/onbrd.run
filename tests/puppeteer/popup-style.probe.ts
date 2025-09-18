import http from "http";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const ROOT = path.resolve("extension/dist");

// minimal mime map
const MIME: Record<string,string> = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2":"font/woff2"
};

function serve() {
  return new Promise<http.Server>((resolve) => {
    const srv = http.createServer((req, res) => {
      try {
        const u = new URL(req.url || "/", "http://127.0.0.1:4100");
        let file = path.join(ROOT, decodeURIComponent(u.pathname));
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
          // default to popup for dir requests
          file = path.join(file, "src/popup/popup.html");
        }
        if (!fs.existsSync(file)) {
          res.statusCode = 404; res.end("not found"); return;
        }
        const ext = path.extname(file).toLowerCase();
        res.setHeader("content-type", MIME[ext] || "application/octet-stream");
        res.end(fs.readFileSync(file));
      } catch (e:any) {
        res.statusCode = 500; res.end(String(e?.message || e));
      }
    }).listen(4100, () => resolve(srv));
  });
}

(async () => {
  if (!fs.existsSync(path.join(ROOT, "src/popup/popup.html"))) {
    console.error("Missing built popup at", path.join(ROOT, "src/popup/popup.html"));
    process.exit(1);
  }

  const srv = await serve();
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();

  const consoleLogs:string[] = [];
  page.on("console", msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  const reqFails:string[] = [];
  page.on("requestfailed", r => reqFails.push(`${r.method()} ${r.url()} ${r.failure()?.errorText || ""}`));

  await page.goto("http://127.0.0.1:4100/src/popup/popup.html", { waitUntil: "networkidle0" });

  // Wait for Svelte to mount; the .card element should exist if App.svelte rendered
  await page.waitForSelector(".card", { timeout: 3000 }).catch(()=>{});

  const existsCard = !!(await page.$(".card"));
  const btnStyles = await page.evaluate(() => {
    const el = document.querySelector(".btn") as HTMLElement | null;
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      bg: s.backgroundColor,
      radius: s.borderRadius,
      weight: s.fontWeight
    };
  });

  console.log("Exists.card:", existsCard);
  console.log("Button styles:", btnStyles);

  if (!existsCard || !btnStyles) {
    console.log("=== Console logs ===");
    consoleLogs.forEach(l => console.log(l));
    console.log("=== Request failures ===");
    reqFails.forEach(l => console.log(l));
    // Exit non-zero so CI/dev loop flags it
    process.exit(1);
  }

  await browser.close();
  srv.close();
})();