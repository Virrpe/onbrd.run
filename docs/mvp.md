r# MVP Scope & Constraints

## Core Value Proposition
OnboardingAudit.ai delivers ongoing pulse checks for user onboarding flows with benchmarking and actionable outputs—not one-off audits.

## Architecture Constraints
- **Hybrid minimal**: MV3 Chrome extension + tiny serverless backend
- **Storage**: Turso/SQLite with offline fallback via IndexedDB
- **Cross-domain**: Backend proxy for public page analysis
- **Offline capability**: Export/import audit-history JSON

## Heuristic Cap (5 until 10 paying users)
1. H-CTA-ABOVE-FOLD - Call-to-action visibility
2. H-STEPS-COUNT - Onboarding step complexity
3. H-COPY-CLARITY - Message clarity and conciseness
4. H-TRUST-MARKERS - Trust signals and social proof
5. H-PERCEIVED-SIGNUP-SPEED - Perceived time to complete

## Monetization
- Free: Preview + 1 watermarked export
- Pro: $99/month (individual)
- Team: $299/month (team collaboration)

## Success Metrics
- 10 paying users = unlock additional heuristics
- Weekly active audits > 50
- Report sharing rate > 30%