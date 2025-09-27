# Benchmark Matrix Strategy

This document describes the enhanced benchmark matrix strategy implemented in the OnboardingAudit.ai CI/CD pipeline.

## Overview

The benchmark workflow now uses a matrix strategy to run 6 canonical command combinations (A-F) that test different aspects of the onboarding flow evaluation system. Each combination represents a specific test scenario with defined acceptance thresholds.

## Matrix Parameters

### Core Parameters
- **set**: `train` | `holdout` - Determines which fixture set to use
- **perturb**: `none` | `light` - Controls DOM perturbation level
- **falsified**: `true` | `false` - Enables label shuffling for falsification tests
- **band_midpoint**: `true` | `false` - Controls band midpoint vs random point selection

### Derived Parameters
- **name**: Human-readable identifier for each matrix combination
- **strict_validation**: Enhanced validation for critical tests

## The 6 Canonical Command Combinations

### A) Baseline — Train set, no perturbation
- **Purpose**: Establish baseline performance metrics
- **Command**: `node scripts/run-benchmarks.mjs --seed 12345 --out benchmarks/results-A.json`
- **Validation**: Standard validation with high performance thresholds
- **Acceptance Criteria**:
  - Macro-F1 ≥ 0.85
  - R² ≥ 0.80
- **Artifact**: `onbrd-benchmarks-A-Baseline-Train-NoPerturb`

### B) Perturbation — Train set, light perturbation
- **Purpose**: Test robustness to DOM perturbations
- **Command**: `node scripts/run-benchmarks.mjs --seed 12345 --perturb-dom=light --out benchmarks/results-B.json`
- **Validation**: Standard validation, check for score drift in report
- **Acceptance Criteria**: Performance should remain stable (no significant degradation)
- **Artifact**: `onbrd-benchmarks-B-Perturbation-Train-Light`

### C) Holdout — No perturbation
- **Purpose**: Evaluate generalization to unseen data
- **Command**: `node scripts/run-benchmarks.mjs --seed 12345 --category=basic-signup --out benchmarks/results-C.json`
- **Validation**: Standard validation with holdout fixtures
- **Acceptance Criteria**:
  - Macro-F1 ≥ 0.80
  - R² ≥ 0.75
- **Artifact**: `onbrd-benchmarks-C-Holdout-NoPerturb`

### D) Falsification — Train set with label shuffle
- **Purpose**: Verify that shuffled labels degrade performance (integrity check)
- **Command**: `node scripts/run-benchmarks.mjs --seed 12345 --out benchmarks/results-D.json`
- **Validation**: `node scripts/validate-benchmarks.mjs --shuffle-labels=true --band-midpoint=false`
- **Acceptance Criteria**:
  - Macro-F1 ≤ 0.40 (performance should degrade significantly)
  - R² ≤ 0.10
- **Artifact**: `onbrd-benchmarks-D-Falsification-Train-Shuffle`

### E) Band-midpoint ablation — Random point within bands
- **Purpose**: Test sensitivity to band midpoint selection
- **Command**: `node scripts/run-benchmarks.mjs --seed 12345 --out benchmarks/results-E.json`
- **Validation**: `node scripts/validate-benchmarks.mjs --band-midpoint=false`
- **Acceptance Criteria**: Should show R² reduction compared to baseline
- **Artifact**: `onbrd-benchmarks-E-BandMidpoint-Ablation`

### F) Leakage sentry (must pass)
- **Purpose**: Critical validation with strict thresholds (same as baseline but stricter)
- **Command**: `node scripts/run-benchmarks.mjs --seed 12345 --out benchmarks/results-F.json`
- **Validation**: Enhanced validation with strict thresholds
- **Acceptance Criteria**:
  - Macro-F1 ≥ 0.90
  - R² ≥ 0.85
- **Artifact**: `onbrd-benchmarks-F-Leakage-Sentry`

## Workflow Structure

### Matrix Job Names
Each matrix job is named according to its combination:
- `A-Baseline-Train-NoPerturb`
- `B-Perturbation-Train-Light`
- `C-Holdout-NoPerturb`
- `D-Falsification-Train-Shuffle`
- `E-BandMidpoint-Ablation`
- `F-Leakage-Sentry`

### Artifact Naming Convention
All artifacts follow the pattern: `onbrd-benchmarks-{name}`
Where `{name}` is the matrix job name.

### Acceptance Threshold Validation
The workflow includes automated acceptance threshold validation:
1. **Falsification tests**: Must show degraded performance (low F1, low R²)
2. **Holdout tests**: Must maintain reasonable performance
3. **Baseline tests**: Must achieve high performance
4. **Leakage sentry**: Must achieve very high performance

### Summary Generation
After all matrix jobs complete, a comprehensive summary is generated that aggregates results from all combinations and provides an overall status check.

## Implementation Details

### Fixtures Directory Selection
- **Train set**: Uses `benchmarks/fixtures/`
- **Holdout set**: Uses `benchmarks/fixtures_holdout/`

### Command Line Arguments
The workflow dynamically constructs command-line arguments based on matrix parameters:
- `--perturb-dom={perturb}` for perturbation tests
- `--category=basic-signup` for holdout tests
- `--shuffle-labels=true` for falsification tests
- `--band-midpoint=false` for band midpoint ablation

### Threshold Validation Logic
The workflow uses shell scripts with `bc` for floating-point comparisons to validate:
- Macro-F1 thresholds
- R² thresholds
- Test-specific criteria

## Usage

### Manual Trigger
The workflow can be triggered manually via GitHub Actions UI or API:
```bash
gh workflow run onbrd-benchmarks.yml
```

### Scheduled Runs
The workflow runs automatically every night at 2:17 AM UTC:
```yaml
schedule:
  - cron: "17 2 * * *"
```

### Monitoring
- Individual job results are available as separate artifacts
- Comprehensive matrix summary is generated as `onbrd-benchmarks-matrix-summary`
- Overall workflow status reflects the success/failure of all matrix combinations

## Troubleshooting

### Common Issues
1. **Threshold failures**: Check the specific test that failed and review the metrics
2. **Missing artifacts**: Verify that all previous steps completed successfully
3. **Command errors**: Check the workflow logs for specific error messages

### Debug Mode
Add `--verbose` flag to benchmark commands for detailed logging:
```bash
node scripts/run-benchmarks.mjs --verbose --seed 12345
```

## Future Enhancements
- Additional perturbation modes (medium, heavy)
- More sophisticated threshold validation
- Integration with external monitoring systems
- Performance trend analysis over time