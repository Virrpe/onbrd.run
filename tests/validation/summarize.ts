import fs from "fs";
import path from "path";

const IN = path.resolve("tests/validation/out/results.jsonl");
const OUT_DIR = path.resolve("tests/validation/out");
const CSV = path.join(OUT_DIR, "summary.csv");
const HTML = path.join(OUT_DIR, "summary.html");

type Rec = {
  page: string;
  score: number | null;
  rules: Array<{ id: string; passed: boolean }>;
  golden?: { expectPass: string[]; expectFail: string[]; passOk: boolean; failOk: boolean };
};

function readJsonl(p: string): Rec[] {
  const txt = fs.readFileSync(p, "utf8").trim();
  if (!txt) return [];
  return txt.split("\n").map((l) => JSON.parse(l));
}

function main() {
  if (!fs.existsSync(IN)) {
    console.error("Missing", IN);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = readJsonl(IN);
  const perRule = new Map<string, { seen: number; passed: number }>();
  let goldenTotal = 0,
    goldenOK = 0;

  for (const r of rows) {
    for (const rr of r.rules || []) {
      const acc = perRule.get(rr.id) || { seen: 0, passed: 0 };
      acc.seen += 1;
      if (rr.passed) acc.passed += 1;
      perRule.set(rr.id, acc);
    }
    if (r.golden) {
      goldenTotal += 1;
      if (r.golden.passOk && r.golden.failOk) goldenOK += 1;
    }
  }

  // CSV
  let csv = "rule_id,seen,pass_rate\n";
  for (const [id, acc] of perRule.entries()) {
    const pr = acc.seen ? acc.passed / acc.seen : 0;
    csv += `${id},${acc.seen},${pr.toFixed(3)}\n`;
  }
  const goldenRate = goldenTotal ? goldenOK / goldenTotal : 0;
  csv += `golden_cases,${goldenTotal},${goldenRate.toFixed(3)}\n`;
  fs.writeFileSync(CSV, csv);

  // HTML
  const rowsHtml = Array.from(perRule.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([id, acc]) => {
      const pr = acc.seen ? (100 * acc.passed) / acc.seen : 0;
      return `<tr><td>${id}</td><td>${acc.seen}</td><td>${pr.toFixed(1)}%</td></tr>`;
    })
    .join("");
  const goldenPct = (100 * goldenRate).toFixed(1);

  const html = `<!doctype html><meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 20px; }
    table { border-collapse: collapse; }
    td, th { border: 1px solid #ddd; padding: 8px 10px; }
    thead { background: #f5f5f5; }
  </style>
  <h1>Onbrd Validation Summary</h1>
  <p>Golden cases passing: <b>${goldenOK}/${goldenTotal}</b> (${goldenPct}%).</p>
  <table>
    <thead><tr><th>Rule</th><th>Seen</th><th>Pass rate</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>`;
  fs.writeFileSync(HTML, html);

  console.log("[validation] Wrote", CSV, "and", HTML);
}

main();