# Unified Diffs for OnboardingAudit.ai Enterprise Refactoring

## Core Logic Refactoring

### packages/core/src/probes.ts

**BEFORE:**
```typescript
import { Audit, Heuristics, Scores, Recommendation } from './types';

// Heuristic weights from docs/heuristics.md
const HEURISTIC_WEIGHTS = {
  h_cta_above_fold: 0.25,
  h_steps_count: 0.20,
  h_copy_clarity: 0.20,
  h_trust_markers: 0.20,
  h_perceived_signup_speed: 0.15
} as const;

// Heuristic fix texts from docs/heuristics.md
const HEURISTIC_FIXES = {
  h_cta_above_fold: "Move your primary CTA above the fold for immediate visibility",
  h_steps_count: "Reduce onboarding to 3 steps or fewer when possible",
  h_copy_clarity: "Use shorter sentences, active voice, and plain language",
  h_trust_markers: "Add testimonials, security badges, or customer logos",
  h_perceived_signup_speed: "Minimize required fields and show progress indicators"
} as const;

export function performAudit(): Audit {
  const heuristics = detectHeuristics();
  const scores = calculateScores(heuristics);
  const recommendations = generateRecommendations(heuristics);
  
  return {
    id: generateAuditId(),
    url: window.location.href,
    timestamp: new Date().toISOString(),
    heuristics,
    scores,
    recommendations
  };
}
```

**AFTER:**
```typescript
import { Audit, Heuristics } from './types';
import { calculateScores, generateRecommendations } from './scoring';

export function performAudit(): Audit {
  const heuristics = detectHeuristics();
  const scores = calculateScores(heuristics);
  const recommendations = generateRecommendations(heuristics);
  
  return {
    id: generateAuditId(),
    url: window.location.href,
    timestamp: new Date().toISOString(),
    heuristics,
    scores,
    recommendations
  };
}
```

**REMOVED:** 
- Duplicate constants `HEURISTIC_WEIGHTS` and `HEURISTIC_FIXES`
- Duplicate functions `calculateScores()` and `generateRecommendations()`
- Import of `Scores` and `Recommendation` types (no longer needed)

**ADDED:**
- Import of scoring functions from `./scoring`
- Simplified import statement for types

### packages/core/src/scoring.ts

**NO CHANGES** - This file already contained the authoritative implementations of:
- `HEURISTIC_WEIGHTS` constants
- `HEURISTIC_FIXES` constants  
- `calculateScores()` function
- `generateRecommendations()` function
- All utility functions (`getScoreColor`, `getScoreLabel`, etc.)

The scoring.ts file remains the single source of truth for all scoring logic.

## Enterprise API Stubs Created

### Auth Endpoints
- `backend/src/app/api/v1/auth/signup/route.ts` - User registration stub
- `backend/src/app/api/v1/auth/login/route.ts` - User authentication stub  
- `backend/src/app/api/v1/auth/logout/route.ts` - Session termination stub
- `backend/src/app/api/v1/auth/session/route.ts` - Session management stub

### Billing Endpoints
- `backend/src/app/api/v1/billing/webhook/route.ts` - Stripe webhook handler stub
- `backend/src/app/api/v1/billing/subscription/route.ts` - Subscription management stub

### Organization Endpoints
- `backend/src/app/api/v1/org/teams/route.ts` - Team management stub (GET/POST)

### Custom Rules Endpoints
- `backend/src/app/api/v1/rules/custom/route.ts` - Custom audit rules stub (GET/POST)

### Analytics Endpoints
- `backend/src/app/api/v1/analytics/cohort/route.ts` - Cohort analytics stub
- `backend/src/app/api/v1/analytics/retention/route.ts` - Retention analytics stub

## Test Files Created

### Unit Tests
- `packages/core/src/scoring.test.ts` - Comprehensive unit tests for scoring functions
- `packages/core/src/probes.test.ts` - Unit tests for probe detection functions

### Integration Tests
- `backend/tests/api-stubs.test.ts` - Integration tests confirming all API stubs return 501

## Configuration Updates

### package.json
**ADDED:**
```json
"test:coverage": "vitest --coverage",
"test:coverage:unit": "vitest -w=false --coverage",
```

### .github/workflows/verify.yml
**ADDED:**
```yaml
- name: Run unit tests with coverage
  run: |
    pnpm -w run test:coverage:unit
    # Check if coverage meets threshold (80%)
    if [ ! -f coverage/coverage-summary.json ]; then
      echo "Coverage summary not found"
      exit 1
    fi
    # Extract overall coverage percentage
    COVERAGE=$(node -e "
      const summary = require('./coverage/coverage-summary.json');
      const total = summary.total;
      const percentage = Math.round((total.lines.pct + total.functions.pct + total.branches.pct + total.statements.pct) / 4);
      console.log(percentage);
    ")
    echo "Overall test coverage: ${COVERAGE}%"
    if [ "$COVERAGE" -lt 80 ]; then
      echo "Test coverage ${COVERAGE}% is below required 80%"
      exit 1
    fi
    echo "Coverage check passed: ${COVERAGE}%"
```

## Import Path Updates

All existing imports remain unchanged because:
1. The `packages/core/src/index.ts` file exports everything from both `probes.ts` and `scoring.ts`
2. The `performAudit()` function signature remains identical
3. All scoring functions are still available through the main index export

**BACKWARDS COMPATIBILITY MAINTAINED** - No breaking changes to existing API consumers.

## Summary of Changes

✅ **Duplication Removed:** Constants and scoring logic removed from probes.ts
✅ **Single Responsibility:** probes.ts handles detection only, scoring.ts handles scoring
✅ **Enterprise APIs:** 10 new API stub endpoints created
✅ **Test Coverage:** Unit and integration tests added with 80% coverage threshold
✅ **CI/CD Enhanced:** GitHub workflow updated with coverage enforcement
✅ **Backwards Compatible:** No breaking changes to existing consumers

All changes are atomic and reversible in a single commit.