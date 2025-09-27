#!/usr/bin/env node
import fs from 'node:fs/promises';

// --- Deterministic PRNG for falsification/ablation ---
function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Utilities ---
function computeR2(y, yhat){
  const n = y.length; if (!n) return null;
  const mean = y.reduce((a,b)=>a+b,0)/n;
  let ssRes=0, ssTot=0;
  for (let i=0;i<n;i++){ ssRes += (y[i]-yhat[i])**2; ssTot += (y[i]-mean)**2; }
  return ssTot ? 1 - (ssRes/ssTot) : null;
}

// Picks numeric target: prefer explicit numeric; else midpoint; when ablation=false uses midpoint; when ablation=true sample within band.
function deriveNumericTarget(exp, rand, bandMidpoint=true){
  if (!exp) return null;
  if (typeof exp.score_numeric === 'number') return exp.score_numeric;
  if (Array.isArray(exp.score_band) && exp.score_band.length === 2) {
    const [lo, hi] = exp.score_band;
    if (typeof lo === 'number' && typeof hi === 'number') {
      if (bandMidpoint) return (lo + hi) / 2;
      const r = rand ? rand() : Math.random();
      return lo + r * (hi - lo);
    }
  }
  return null;
}

// Build per-check confusion counts, then precision/recall/F1
function computePerCheckMetrics(items){
  const counts = {}; // h -> {tp,fp,fn,tn}
  for (const it of items){
    const p = (it.pred && it.pred.checks) || {};
    const e = (it.expected && it.expected.checks) || {};
    const keys = new Set([...Object.keys(p), ...Object.keys(e)]);
    for (const k of keys){
      const pv = !!p[k];
      const ev = !!e[k];
      counts[k] ||= {tp:0, fp:0, fn:0, tn:0};
      if (pv && ev) counts[k].tp++;
      else if (pv && !ev) counts[k].fp++;
      else if (!pv && ev) counts[k].fn++;
      else counts[k].tn++;
    }
  }
  const metrics = {};
  for (const [k,c] of Object.entries(counts)){
    const prec = (c.tp + c.fp) ? c.tp / (c.tp + c.fp) : 1;
    const rec  = (c.tp + c.fn) ? c.tp / (c.tp + c.fn) : 1;
    const f1   = (prec+rec) ? 2*prec*rec/(prec+rec) : 0;
    metrics[k] = { precision: +prec.toFixed(4), recall: +rec.toFixed(4), f1: +f1.toFixed(4) };
  }
  return metrics;
}

function macroF1(perCheck){
  const vals = Object.values(perCheck).map(x => x.f1).filter(x => typeof x === 'number');
  return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
}

function computeCalibration(items){
  const y=[], yhat=[];
  for (const it of items){
    if (typeof it.pred?.score_calibrated === 'number' && typeof it.expected_numeric === 'number'){
      y.push(it.expected_numeric);
      yhat.push(it.pred.score_calibrated);
    }
  }
  const n = y.length;
  const r2 = n ? computeR2(y,yhat) : null;
  return { r2: r2==null ? null : +r2.toFixed(4), n };
}

// Command line argument parsing
const parseArgs = () => {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.split('=');
      if (value !== undefined) {
        args[key] = value.trim();
      } else if (i + 1 < process.argv.length && !process.argv[i + 1].startsWith('--')) {
        args[key] = process.argv[++i].trim();
      } else {
        args[key] = 'true'; // boolean flag
      }
    }
  }
  return args;
};

const args = parseArgs();
const IN = args["--in"] || "benchmarks/results.json";
const OUT = args["--out"] || "benchmarks/eval.json";
const SHUFFLE_LABELS = args["--shuffle-labels"] === 'true';
const BAND_MIDPOINT = args["--band-midpoint"] !== 'false'; // default true
const SEED = parseInt(args["--seed"] || "1337", 10);

// Load results
const resultsRaw = await fs.readFile(IN, "utf8");
const resultsData = JSON.parse(resultsRaw);

// Handle both old format (direct array) and new format (nested under results property)
const results = Array.isArray(resultsData) ? resultsData : resultsData.results || [];

// Build a working list that includes predictions and expected labels
const baseItems = results.map(r => ({
  pred: { score: r.score, score_calibrated: r.score_calibrated, checks: r.checks || {} },
  expected: r.expected || {}
}));

// Derive numeric targets for baseline calibration (midpoint mode)
for (const it of baseItems) {
  it.expected_numeric = deriveNumericTarget(it.expected, null, /*bandMidpoint=*/true);
}

// Baseline per-check + calibration
const baselineChecks = computePerCheckMetrics(baseItems);
const baselineCal    = computeCalibration(baseItems);
const out = {
  generatedAt: new Date().toISOString(),
  config: { shuffleLabels: SHUFFLE_LABELS, bandMidpoint: BAND_MIDPOINT, seed: SEED },
  baseline_metrics: {
    checks: baselineChecks,
    calibration: baselineCal,
    macro_f1: macroF1(baselineChecks)
  }
};

// Falsification: shuffle expected labels per-check consistently
if (SHUFFLE_LABELS) {
  const rnd = mulberry32(SEED);
  const keys = Object.keys(baselineChecks);
  const perm = [...keys];
  for (let i=perm.length-1;i>0;i--){
    const j = Math.floor(rnd()*(i+1));
    [perm[i],perm[j]] = [perm[j],perm[i]];
  }
  const mapTo = new Map(keys.map((k,i)=>[k, perm[i]]));

  const falsifiedItems = baseItems.map(it => {
    const exp = it.expected?.checks || {};
    const shuffledExpected = {};
    for (const [k,v] of Object.entries(exp)){
      const k2 = mapTo.get(k) ?? k;
      shuffledExpected[k2] = v;
    }
    return {
      pred: it.pred,
      expected: { ...it.expected, checks: shuffledExpected },
      expected_numeric: it.expected_numeric
    };
  });
  const fChecks = computePerCheckMetrics(falsifiedItems);
  out.falsified_metrics = {
    checks: fChecks,
    macro_f1: macroF1(fChecks)
  };
}

// Ablation: use random-in-band instead of midpoints for numeric targets
if (BAND_MIDPOINT === false) {
  const rnd = mulberry32(SEED);
  const ablated = baseItems.map(it => {
    const expNum = deriveNumericTarget(it.expected, rnd, /*bandMidpoint=*/false);
    return { pred: it.pred, expected: it.expected, expected_numeric: expNum };
  });
  const aChecks = computePerCheckMetrics(ablated); // labels unchanged
  const aCal    = computeCalibration(ablated);
  out.ablated_metrics = {
    checks: aChecks,
    calibration: aCal,
    macro_f1: macroF1(aChecks)
  };
}

await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
console.log("Wrote", OUT);
console.log(`Configuration: shuffle-labels=${SHUFFLE_LABELS}, band-midpoint=${BAND_MIDPOINT}, seed=${SEED}`);