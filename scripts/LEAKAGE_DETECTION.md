# Leakage Detection Script

## Overview

The `leakage_check.mjs` script implements comprehensive leakage detection for the OnboardingAudit.ai scoring system. It ensures that the scoring logic does not directly access ground truth data from benchmark fixtures, which would invalidate the benchmark results.

## Purpose

This script prevents the scoring system from "cheating" by:
- Detecting direct imports of `meta.json` files containing ground truth data
- Identifying ground truth keys used as DOM selectors or hardcoded values
- Finding direct access to ground truth object properties
- Spotting fixture directory traversal in scoring logic

## Usage

### Basic Usage
```bash
# Run directly
node scripts/leakage_check.mjs

# Or use npm script
npm run leakage:check
```

### Integration with CI/CD
Add to your CI pipeline to ensure no leakage is introduced:
```yaml
- name: Check for ground truth leakage
  run: npm run leakage:check
```

## Detection Patterns

The script searches for these specific leakage patterns:

### Critical Violations (Scoring/Probe Logic)
- **Meta.json imports**: `import metaData from './fixtures/meta.json'`
- **Fixture path access**: References to `fixtures_holdout` or `benchmarks/fixtures`
- **Ground truth DOM selectors**: Using ground truth keys like `h_cta_above_fold` in `querySelector()` calls
- **Direct ground truth access**: Accessing `ground_truth` or `groundTruth` objects

### Medium Risk (Other Files)
- **Ground truth references**: General references to ground truth data structures

## File Classification

### Strict Files (No Ground Truth References Allowed)
- `packages/core/src/scoring.ts` - Core scoring logic
- `packages/core/src/probes.ts` - Heuristic detection logic
- `packages/core/src/probes/*` - Individual probe implementations
- `packages/core/src/rules/*` - Rule implementations

### Allowed Files (Can Reference Ground Truth)
- `scripts/validate-benchmarks.mjs` - Benchmark validation scripts
- `scripts/run-benchmarks.mjs` - Benchmark execution scripts
- `scripts/gen-fixture.mjs` - Fixture generation scripts
- `scripts/test-report-metadata.js` - Test metadata scripts
- `scripts/verify.ts` - Verification scripts
- `scripts/leakage_check.mjs` - This detection script itself

## Exit Codes

- **0**: No leakage detected (success)
- **1**: Leakage detected (failure)

## Output Format

The script provides detailed reporting:
- Number of files scanned
- Specific files with potential leakage
- Type of leakage detected
- Line numbers and context
- Severity levels (critical vs medium)

## Example Output

```
🔍 ONBOARDING AUDIT LEAKAGE DETECTION REPORT
================================================================================
📊 Scanned 33 files
🔍 Found 1 files with potential leakage

⚠️  POTENTIAL LEAKAGE FOUND:

1. 📄 packages/core/src/scoring.ts
   🚨 META_JSON_IMPORT
      Pattern: meta.json import in scoring logic
      Line(s): 15
      Matches: import metaData from '../fixtures/meta.json'

📋 SUMMARY:
----------------------------------------
  meta_json_import: 1

🚨 LEAKAGE DETECTED - This indicates the scoring system may be using
   ground truth data directly, which would invalidate benchmark results.
```

## Implementation Details

### Search Patterns
- Uses regex patterns to detect specific leakage signatures
- Distinguishes between legitimate heuristic key usage and actual leakage
- Applies different strictness levels based on file classification

### File Scanning
- Recursively scans specified directories
- Filters by file extensions (.ts, .js, .tsx, .jsx, .mjs)
- Excludes node_modules and build directories
- Respects file classification rules

### Error Handling
- Graceful handling of file read errors
- Detailed error logging for debugging
- Continues scanning even if individual files fail

## Best Practices

1. **Run Regularly**: Execute as part of your development workflow
2. **CI Integration**: Add to pre-commit hooks or CI pipelines
3. **Review Findings**: Carefully review any detected leakage
4. **Fix Immediately**: Address leakage before merging code
5. **Update Patterns**: Extend patterns as new leakage methods are discovered

## Contributing

When adding new detection patterns:
1. Test thoroughly with both positive and negative cases
2. Update this documentation
3. Consider the impact on legitimate code patterns
4. Maintain backward compatibility

## Troubleshooting

### False Positives
If legitimate code is flagged:
- Review the detection pattern context
- Consider if the file classification needs adjustment
- Check if the pattern is too broad

### False Negatives
If actual leakage is missed:
- Add new detection patterns
- Test with known leakage examples
- Consider edge cases in file classification