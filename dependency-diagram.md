# OnboardingAudit.ai System Dependency Diagram

## Current Architecture (with Duplication Issues)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Extension (MV3)                    │  Site (Static)                        │
│  ┌─────────────────┐               │  ┌─────────────────┐                  │
│  │ popup/App.svelte│               │  │ index.html      │                  │
│  │ content/entry.ts│               │  │ styles.css      │                  │
│  │ shared/inject.ts│               │  │ tokens.css      │                  │
│  └────────┬────────┘               │  └─────────────────┘                  │
└───────────┼─────────────────────────┴───────────────────────────────────────┘
            │                                                                  
┌───────────┼─────────────────────────────────────────────────────────────────┐
│           │                    Core Logic Layer (DUPLICATION ISSUE)         │
│  ┌────────▼────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ packages/core   │  │ packages/core   │  │ packages/report │            │
│  │ src/probes.ts   │  │ src/scoring.ts  │  │ src/index.ts    │            │
│  │                 │  │                 │  │                 │            │
│  │ ❌ CONTAINS:    │  │ ✅ CONTAINS:    │  │                 │            │
│  │ • detectCTA()   │  │ • calculateScores() │             │            │
│  │ • countSteps()  │  │ • generateIssues()  │             │            │
│  │ • analyzeCopy() │  │ • generateRecommendations() │     │            │
│  │ • findTrust()   │  │ • getScoreColor()   │             │            │
│  │ • estimateSpeed()│ │ • getScoreLabel()   │             │            │
│  │                 │  │                 │  │                 │            │
│  │ ❌ ALSO CONTAINS:│ │ ✅ CONSTANTS:   │  │                 │            │
│  │ • calculateScores() │ • HEURISTIC_WEIGHTS │             │            │
│  │ • generateRecommendations() │ • HEURISTIC_FIXES │       │            │
│  │ • HEURISTIC_WEIGHTS │                 │  │                 │            │
│  │ • HEURISTIC_FIXES │                 │  │                 │            │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
└───────────┼────────────────────┼────────────────────┼──────────────────────┘
            │                    │                    │
┌───────────┼────────────────────┼────────────────────┼──────────────────────┐
│           │                    │                    │   Backend API Layer   │
│  ┌────────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐              │
│  │ POST /api/v1/   │  │ GET /api/v1/   │  │ GET /api/      │              │
│  │ ingest          │  │ rules          │  │ healthz        │              │
│  │                 │  │                │  │                │              │
│  │ • Validation    │  │ • Rule manifest│  │ • Health check │              │
│  │ • Rate limiting │  │ • Scoring config│ │ • Timestamp    │              │
│  │ • PostgreSQL    │  │ • ETag caching │  │                │              │
│  │ • Benchmarks    │  │ • Validation   │  │                │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└──────────────────────────────────────────────────────────────────────────────┘

## Duplication Issues Identified

1. **HEURISTIC_WEIGHTS** - Defined in both `probes.ts` and `scoring.ts`
2. **HEURISTIC_FIXES** - Defined in both `probes.ts` and `scoring.ts`
3. **calculateScores()** - Implemented in both `probes.ts` and `scoring.ts`
4. **generateRecommendations()** - Implemented in both `probes.ts` and `scoring.ts`

## Proposed Refactored Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Extension (MV3)                    │  Site (Static)                        │
│  ┌─────────────────┐               │  ┌─────────────────┐                  │
│  │ popup/App.svelte│               │  │ index.html      │                  │
│  │ content/entry.ts│               │  │ styles.css      │                  │
│  │ shared/inject.ts│               │  │ tokens.css      │                  │
│  └────────┬────────┘               │  └─────────────────┘                  │
└───────────┼─────────────────────────┴───────────────────────────────────────┘
            │                                                                  
┌───────────┼─────────────────────────────────────────────────────────────────┐
│           │                    Core Logic Layer (REFACTORED)               │
│  ┌────────▼────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ packages/core   │  │ packages/core   │  │ packages/report │            │
│  │ src/probes.ts   │  │ src/scoring.ts  │  │ src/index.ts    │            │
│  │                 │  │                 │  │                 │            │
│  ✅ CONTAINS:      │  ✅ CONTAINS:      │  │                 │            │
│  │ • detectCTA()   │  │ • calculateScores() │             │            │
│  │ • countSteps()  │  │ • generateIssues()  │             │            │
│  │ • analyzeCopy() │  │ • generateRecommendations() │     │            │
│  │ • findTrust()   │  │ • getScoreColor()   │             │            │
│  │ • estimateSpeed()│ │ • getScoreLabel()   │             │            │
│  │ • performAudit()│  │ • CONSTANTS:        │             │            │
│  │                 │  │   - HEURISTIC_WEIGHTS │           │            │
│  │ ❌ REMOVED:     │  │   - HEURISTIC_FIXES │             │            │
│  │ • calculateScores() │                 │  │                 │            │
│  │ • generateRecommendations() │         │  │                 │            │
│  │ • HEURISTIC_WEIGHTS │                 │  │                 │            │
│  │ • HEURISTIC_FIXES │                 │  │                 │            │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
└───────────┼────────────────────┼────────────────────┼──────────────────────┘
            │                    │                    │
┌───────────┼────────────────────┼────────────────────┼──────────────────────┐
│           │                    │                    │   Backend API Layer   │
│  ┌────────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐              │
│  │ POST /api/v1/   │  │ GET /api/v1/   │  │ GET /api/      │              │
│  │ ingest          │  │ rules          │  │ healthz        │              │
│  │                 │  │                │  │                │              │
│  │ • Validation    │  │ • Rule manifest│  │ • Health check │              │
│  │ • Rate limiting │  │ • Scoring config│ │ • Timestamp    │              │
│  │ • PostgreSQL    │  │ • ETag caching │  │                │              │
│  │ • Benchmarks    │  │ • Validation   │  │                │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                             │
│  🆕 ENTERPRISE API STUBS:                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ POST /api/v1/auth/signup     │ GET /api/v1/org/teams               │    │
│  │ POST /api/v1/auth/login      │ POST /api/v1/org/teams              │    │
│  │ POST /api/v1/auth/logout     │ GET /api/v1/rules/custom            │    │
│  │ GET  /api/v1/auth/session    │ POST /api/v1/rules/custom           │    │
│  │ POST /api/v1/billing/webhook │ GET /api/v1/analytics/cohort        │    │
│  │ GET /api/v1/billing/subscription│ GET /api/v1/analytics/retention  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘

## Key Changes

1. **Single Responsibility**: `probes.ts` handles detection only, `scoring.ts` handles scoring logic
2. **Constants Consolidation**: All constants moved to `scoring.ts`
3. **Import Updates**: All consumers import from `scoring.ts` for scoring functions
4. **Enterprise APIs**: New stub endpoints for auth, billing, org, rules/custom, analytics
5. **Test Coverage**: Added unit tests with 80% coverage threshold
6. **CI/CD Updates**: Enhanced workflows with coverage reporting