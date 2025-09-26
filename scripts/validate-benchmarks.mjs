#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

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

// Seeded PRNG implementation (Mulberry32)
class SeededPRNG {
  constructor(seed) {
    this.seed = seed >>> 0;
  }
  
  next() {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    this.seed = (t ^ t >>> 14) >>> 0;
    return this.seed / 4294967296;
  }
}

// Fisher-Yates shuffle implementation
const shuffleArray = (array, prng) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(prng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const results = JSON.parse(fs.readFileSync(IN, "utf8"));
const fixturesRoot = path.join("benchmarks", "fixtures");

// Helpers
const prf = (tp, fp, fn) => {
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  const f1 = (precision + recall) === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1 };
};

// Compute metrics function
const computeMetrics = (results, fixturesRoot, bandMidpoint = true) => {
  const perCheck = {};
  const perCategory = {};
  let globalPairs = []; // for calibration (pred vs truth)

  // Collect all score bands for potential shuffling
  const allScoreBands = [];
  const resultToBandMap = new Map();

  // First pass: collect all score bands
  for (const r of results.results) {
    const metaPath = path.join(fixturesRoot, r.category, r.name.replaceAll(" ", "-").toLowerCase(), "meta.json");
    const meta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, "utf8"))
      : (r.meta || {});

    if (meta.expected?.score_band) {
      allScoreBands.push([...meta.expected.score_band]);
      resultToBandMap.set(r.id || r.name, meta.expected.score_band);
    }
  }

  // Shuffle score bands if requested
  let shuffledBands = [];
  if (SHUFFLE_LABELS && allScoreBands.length > 0) {
    const shufflePrng = new SeededPRNG(SEED);
    shuffledBands = shuffleArray(allScoreBands, shufflePrng);
  }

  // Second pass: process results
  for (let i = 0; i < results.results.length; i++) {
    const r = results.results[i];
    const metaPath = path.join(fixturesRoot, r.category, r.name.replaceAll(" ", "-").toLowerCase(), "meta.json");
    const meta = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, "utf8"))
      : (r.meta || {});

    const truth = meta.ground_truth || {};
    
    // Example boolean check
    const checks = Object.keys(r.individual_scores || {});
    for (const key of checks) {
      if (!(key in perCheck)) perCheck[key] = { tp: 0, fp: 0, fn: 0, count: 0 };
      perCheck[key].count++;
      // Binary truth if present
      if (typeof truth[key] === "boolean") {
        const predictedPos = (r.individual_scores[key] || 0) > 50;
        const truthPos = truth[key] === true;
        if (predictedPos && truthPos) perCheck[key].tp++;
        else if (predictedPos && !truthPos) perCheck[key].fp++;
        else if (!predictedPos && truthPos) perCheck[key].fn++;
      }
    }

    // Category band check
    if (!(r.category in perCategory)) perCategory[r.category] = { total: 0, inBand: 0, scores: [] };
    perCategory[r.category].total++;
    perCategory[r.category].scores.push(r.score);
    
    let band = meta.expected?.score_band;
    
    // Apply shuffling if requested
    if (SHUFFLE_LABELS && band && shuffledBands.length > 0) {
      // Find a shuffled band for this result
      const bandIndex = allScoreBands.findIndex(b =>
        b[0] === band[0] && b[1] === band[1]
      );
      if (bandIndex !== -1 && shuffledBands[bandIndex]) {
        band = shuffledBands[bandIndex];
      }
    }
    
    if (band && r.score >= band[0] && r.score <= band[1]) perCategory[r.category].inBand++;

    // Calibration pair
    if (band) {
      let truthValue;
      if (bandMidpoint) {
        // Use midpoint (original behavior)
        truthValue = (band[0] + band[1]) / 2;
      } else {
        // Use random point within band (ablation)
        const ablationPrng = new SeededPRNG(SEED + i);
        const range = band[1] - band[0];
        truthValue = band[0] + (ablationPrng.next() * range);
      }
      globalPairs.push({ predicted: r.score, truth: truthValue });
    }
  }

  // Compute metrics
  const checkMetrics = Object.fromEntries(Object.entries(perCheck).map(([k, v]) => [k, prf(v.tp, v.fp, v.fn)]));
  const categoryMetrics = Object.fromEntries(Object.entries(perCategory).map(([_k, v]) => {
    const inBandPct = v.total ? (v.inBand / v.total) : 0;
    const mean = v.scores.reduce((a, b) => a + b, 0) / (v.scores.length || 1);
    const variance = v.scores.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (v.scores.length || 1);
    return { total: v.total, inBandPct, mean, std: Math.sqrt(variance) };
  }));

  // Simple R^2 for calibration
  const meanTruth = globalPairs.reduce((a, p) => a + p.truth, 0) / (globalPairs.length || 1);
  const ssTot = globalPairs.reduce((a, p) => a + (p.truth - meanTruth) ** 2, 0);
  const ssRes = globalPairs.reduce((a, p) => a + (p.truth - p.predicted) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  return {
    checks: checkMetrics,
    categories: categoryMetrics,
    calibration: { r2, n: globalPairs.length }
  };
};

// Compute baseline metrics (original behavior)
const baselineMetrics = computeMetrics(results, fixturesRoot, true, null);

// Compute falsified metrics (shuffled labels)
let falsifiedMetrics = null;
if (SHUFFLE_LABELS) {
  falsifiedMetrics = computeMetrics(results, fixturesRoot, true, new SeededPRNG(SEED));
}

// Compute ablated metrics (random band points instead of midpoints)
let ablatedMetrics = null;
if (!BAND_MIDPOINT) {
  ablatedMetrics = computeMetrics(results, fixturesRoot, false, new SeededPRNG(SEED));
}

// Build output structure
const out = {
  generatedAt: new Date().toISOString(),
  config: {
    shuffleLabels: SHUFFLE_LABELS,
    bandMidpoint: BAND_MIDPOINT,
    seed: SEED
  },
  baseline_metrics: baselineMetrics
};

// Add falsified metrics if shuffling was enabled
if (falsifiedMetrics) {
  out.falsified_metrics = falsifiedMetrics;
}

// Add ablated metrics if midpoint ablation was disabled
if (ablatedMetrics) {
  out.ablated_metrics = ablatedMetrics;
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log("Wrote", OUT);
console.log(`Configuration: shuffle-labels=${SHUFFLE_LABELS}, band-midpoint=${BAND_MIDPOINT}, seed=${SEED}`);