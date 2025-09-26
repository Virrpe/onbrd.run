# Benchmarks v0.3 Enhanced Summary

- **Generated:** 2025-09-26T18:17:47.344Z
- **Test Type:** baseline
- **Configuration:** {
  "shuffleLabels": false,
  "bandMidpoint": true,
  "seed": 1337
}

## Headline Metrics

**Test Type:** baseline  
**Train/Test Split:** none  

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Macro-F1 | 1.000 | Macro-F1 ≥ 0.85 | ✅ PASS |
| R² | 1.000 | R² ≥ 0.80 | ✅ PASS |
| Calibration Samples | 0 | - | - |

**Overall Status:** ✅ **ALL CHECKS PASSED**

## Checks (macro)

| Check | Precision | Recall | F1 |
|-------|-----------|--------|-----|
| h_cta_above_fold | 1.00 | 1.00 | 1.00 |
| h_steps_count | 1.00 | 1.00 | 1.00 |
| h_copy_clarity | 1.00 | 1.00 | 1.00 |
| h_trust_markers | 1.00 | 1.00 | 1.00 |
| h_perceived_signup_speed | 1.00 | 1.00 | 1.00 |

## Robustness / Integrity Checks

### Label Shuffle (falsification)

*No falsification test run*

### Band Midpoint Ablation

*No ablation test run*

### DOM Perturbation (light)

*No perturbation test run*

### Holdout vs Train

*No holdout evaluation detected*

## Interpretation

✅ **All robustness checks passed successfully.**

The model demonstrates good performance and reliability under the tested conditions.

## Failures / Alerts

| Alert Type | Severity | Message |
|------------|----------|---------|
| validation | 🟡 medium | Compliance Verification: score 76 outside expected range [40-60] |
| validation | 🟡 medium | Enterprise Multi-User Setup: score 75 outside expected range [45-65] |
| validation | 🟡 medium | Feature Tour Integration: score 89 outside expected range [70-85] |
| validation | 🟡 medium | Guest Checkout Flow: score 97 outside expected range [72-87] |
| validation | 🟡 medium | Integration Configuration: score 79 outside expected range [50-70] |
| validation | 🟡 medium | Minimal Form Design: score 100 outside expected range [80-95] |
| validation | 🟡 medium | Mobile App Tutorial: score 81 outside expected range [65-80] |
| validation | 🟡 medium | Payment Integration Flow: score 89 outside expected range [68-83] |
| validation | 🟡 medium | Progressive Disclosure Flow: score 93 outside expected range [70-85] |
| validation | 🟡 medium | SaaS Multi-Step Wizard: score 90 outside expected range [65-80] |
| validation | 🟡 medium | Shipping Address Collection: score 93 outside expected range [70-85] |
| validation | 🟡 medium | Team Invitation Flow: score 90 outside expected range [68-82] |
| calibration | 🔵 low | Low calibration sample size (0) may affect reliability |

## Reproducibility

### Commands to Reproduce This Analysis

```bash
# Run benchmarks
node scripts/run-benchmarks.mjs --seed=12345 --out="benchmarks/results.json"

# Validate benchmarks
node scripts/validate-benchmarks.mjs --in="benchmarks/results.json" --out="benchmarks/eval.json"

# Generate this report
node scripts/report-benchmarks.mjs --results="benchmarks/results.json" --eval="benchmarks/eval.json" --out="benchmarks/SUMMARY.md"
```

### Configuration

- **Results Path:** `benchmarks/results.json`
- **Eval Path:** `benchmarks/eval.json`
- **Output Path:** `benchmarks/SUMMARY.md`
- **Generated:** 2025-09-26T19:19:44.918Z

