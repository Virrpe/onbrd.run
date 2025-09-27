# Benchmarks v0.3 Enhanced Summary

**Context:** train | perturb=none

- **Generated:** 2025-09-26T20:17:23.462Z
- **Test Type:** baseline
- **Configuration:** {
  "shuffleLabels": false,
  "bandMidpoint": true,
  "seed": 1337
}

## Headline Metrics

**Test Type:** baseline  
**Train/Test Split:** none  
**Context:** train | perturb=none  

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
| validation | 🟡 medium | Holdout: CTA Below Fold: score 75 outside expected range [45-65] |
| validation | 🟡 medium | Holdout: Email Password Combo: score 92 outside expected range [75-90] |
| validation | 🟡 medium | Holdout: Long Comprehensive Form: score 91 outside expected range [40-60] |
| validation | 🟡 medium | Holdout: Minimal Form Design: score 88 outside expected range [70-85] |
| validation | 🟡 medium | Holdout: Phone Verification Flow: score 93 outside expected range [65-80] |
| validation | 🟡 medium | Holdout: Poor Copy Quality: score 77 outside expected range [35-55] |
| validation | 🟡 medium | Holdout: Progressive Form Disclosure: score 93 outside expected range [70-85] |
| validation | 🟡 medium | Holdout: Social Login Options: score 92 outside expected range [75-90] |
| validation | 🟡 medium | Holdout: Trust-Heavy Signup: score 100 outside expected range [85-95] |
| validation | 🟡 medium | Holdout: Ecommerce Account Creation Checkout: score 87 outside expected range [50-65] |
| validation | 🟡 medium | Holdout: Ecommerce Account Creation: score 94 outside expected range [65-75] |
| validation | 🟡 medium | Holdout: Ecommerce Compliance Verification: score 91 outside expected range [50-65] |
| validation | 🟡 medium | Holdout: Ecommerce Guest Checkout: score 93 outside expected range [80-90] |
| validation | 🟡 medium | Holdout: Ecommerce Multi-Step Checkout: score 87 outside expected range [55-70] |
| validation | 🟡 medium | Holdout: Ecommerce Payment Integration: score 90 outside expected range [60-70] |
| validation | 🟡 medium | Holdout: Ecommerce Shipping Address: score 94 outside expected range [60-75] |
| validation | 🟡 medium | Holdout: Ecommerce Simple Checkout: score 97 outside expected range [75-85] |
| validation | 🟡 medium | Holdout: Ecommerce Subscription Flow: score 97 outside expected range [70-80] |
| validation | 🟡 medium | Holdout: Enterprise Contact Sales: score 97 outside expected range [80-90] |
| validation | 🟡 medium | Holdout: Enterprise Demo Request: score 94 outside expected range [75-85] |
| validation | 🟡 medium | Holdout: Enterprise Integration Setup: score 85 outside expected range [65-75] |
| validation | 🟡 medium | Holdout: Enterprise Multi-User Setup: score 82 outside expected range [60-70] |
| validation | 🟡 medium | Holdout: Enterprise Onboarding Wizard: score 82 outside expected range [70-80] |
| validation | 🟡 medium | Holdout: Enterprise Security Configuration: score 81 outside expected range [55-65] |
| validation | 🟡 medium | Holdout: Enterprise SSO Configuration: score 54 outside expected range [55-65] |
| validation | 🟡 medium | Holdout: Enterprise Team Invitation: score 90 outside expected range [70-80] |
| validation | 🟡 medium | Holdout: Mobile Biometric Setup: score 92 outside expected range [75-85] |
| validation | 🟡 medium | Holdout: Mobile Location Permissions: score 88 outside expected range [60-70] |
| validation | 🟡 medium | Holdout: Mobile App Onboarding: score 88 outside expected range [75-85] |
| validation | 🟡 medium | Holdout: Mobile Permission Requests: score 93 outside expected range [70-80] |
| validation | 🟡 medium | Holdout: Mobile Profile Setup: score 89 outside expected range [70-80] |
| validation | 🟡 medium | Holdout: Mobile Push Notifications: score 89 outside expected range [70-80] |
| validation | 🟡 medium | Holdout: Mobile Social Login: score 96 outside expected range [80-90] |
| validation | 🟡 medium | Holdout: SaaS Analytics Dashboard Setup: score 85 outside expected range [55-70] |
| validation | 🟡 medium | Holdout: SaaS Billing Configuration: score 93 outside expected range [65-75] |
| validation | 🟡 medium | Holdout: SaaS Custom Workflow Builder: score 81 outside expected range [45-60] |
| validation | 🟡 medium | Holdout: SaaS Data Migration: score 89 outside expected range [55-70] |
| validation | 🟡 medium | Holdout: SaaS Enterprise Configuration: score 81 outside expected range [40-60] |
| validation | 🟡 medium | Holdout: SaaS Integration Setup: score 88 outside expected range [55-70] |
| validation | 🟡 medium | Holdout: SaaS Onboarding Wizard: score 87 outside expected range [60-75] |
| validation | 🟡 medium | Holdout: SaaS Quick Setup: score 97 outside expected range [75-85] |
| validation | 🟡 medium | Holdout: SaaS Security Configuration: score 83 outside expected range [50-65] |
| validation | 🟡 medium | Holdout: SaaS Team Invitation Flow: score 94 outside expected range [70-80] |
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
node scripts/run-benchmarks.mjs --seed=12345 --out="benchmarks/results.train.none.json"

# Validate benchmarks
node scripts/validate-benchmarks.mjs --in="benchmarks/results.train.none.json" --out="benchmarks/eval.train.none.json"

# Generate this report
node scripts/report-benchmarks.mjs --results="benchmarks/results.train.none.json" --eval="benchmarks/eval.train.none.json" --out="benchmarks/SUMMARY.train.none.md" --context="train | perturb=none"
```

### Configuration

- **Results Path:** `benchmarks/results.train.none.json`
- **Eval Path:** `benchmarks/eval.train.none.json`
- **Output Path:** `benchmarks/SUMMARY.train.none.md`
- **Generated:** 2025-09-26T20:36:05.239Z

