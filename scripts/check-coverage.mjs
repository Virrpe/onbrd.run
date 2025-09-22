#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// Tunable coverage targets (edit here as needed)
// RATCHET RULE: +5% weekly until core 80%, backend 60%
// Next bump: 2025-09-28 (core: 67%, backend: 27%)
// Milestone targets: core 80%, backend 60%
const TARGETS = [
  { label: 'packages/core',  minLines: 62, minStatements: 62 }, // Current: 62.60%
  { label: 'backend',        minLines: 22, minStatements: 22 }  // Current: 22.30%
];

const summaryPath = path.resolve('coverage/coverage-summary.json');
if (!fs.existsSync(summaryPath)) {
  console.error('coverage-summary.json not found. Run "pnpm test:coverage" first.');
  process.exit(2);
}
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

const entries = Object.entries(summary).filter(([k]) => k !== 'total');

function aggregateFor(prefix) {
  let linesCovered=0, linesTotal=0, stmtsCovered=0, stmtsTotal=0;
  for (const [file, metrics] of entries) {
    if (!file.includes(prefix)) continue;
    const l = metrics.lines || { covered:0, total:0 };
    const s = metrics.statements || { covered:0, total:0 };
    linesCovered  += l.covered;  linesTotal  += l.total;
    stmtsCovered  += s.covered;  stmtsTotal  += s.total;
  }
  const linesPct = linesTotal ? (linesCovered/linesTotal*100) : 0;
  const stmtsPct = stmtsTotal ? (stmtsCovered/stmtsTotal*100) : 0;
  return { linesPct, stmtsPct, linesTotal, stmtsTotal };
}

let ok = true;
for (const t of TARGETS) {
  const { linesPct, stmtsPct, linesTotal } = aggregateFor(t.label);
  const passLines = linesPct >= t.minLines;
  const passStmts = stmtsPct >= t.minStatements;
  const status = (passLines && passStmts) ? 'PASS' : 'FAIL';
  console.log(`${t.label}: lines=${linesPct.toFixed(2)}% (min ${t.minLines}%) | statements=${stmtsPct.toFixed(2)}% (min ${t.minStatements}%) | files=${linesTotal ? 'yes' : 'none'} => ${status}`);
  if (!passLines || !passStmts) ok = false;
}
process.exit(ok ? 0 : 1);