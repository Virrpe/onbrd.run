# Heuristic Definitions & Detection Logic

## H-CTA-ABOVE-FOLD
**Weight**: 0.25
**Detection**: Primary call-to-action button in initial viewport (top 600px)
**Rationale**: Users must see the main action immediately
**Fix Text**: "Move your primary CTA above the fold for immediate visibility"

## H-STEPS-COUNT
**Weight**: 0.20
**Detection**: Count of distinct onboarding steps (forms, screens, modals)
**Scoring**: 1-3 steps = 100%, 4-5 = 80%, 6-7 = 60%, 8+ = 40%
**Rationale**: Fewer steps reduce friction and abandonment
**Fix Text**: "Reduce onboarding to 3 steps or fewer when possible"

## H-COPY-CLARITY
**Weight**: 0.20
**Detection**: Average sentence length, passive voice ratio, jargon density
**Scoring**: <15 words/sentence, <10% passive, <5% jargon = 100%
**Rationale**: Clear copy improves comprehension and reduces cognitive load
**Fix Text**: "Use shorter sentences, active voice, and plain language"

## H-TRUST-MARKERS
**Weight**: 0.20
**Detection**: Testimonials, security badges, customer logos, social proof
**Scoring**: 3+ trust elements = 100%, 2 = 80%, 1 = 60%, 0 = 40%
**Rationale**: Trust reduces anxiety and increases conversion
**Fix Text**: "Add testimonials, security badges, or customer logos"

## H-PERCEIVED-SIGNUP-SPEED
**Weight**: 0.15
**Detection**: Form fields, required information, progress indicators
**Scoring**: <30 seconds perceived time = 100%, 30-60s = 80%, 60-120s = 60%, 120s+ = 40%
**Rationale**: Faster perceived completion reduces abandonment
**Fix Text**: "Minimize required fields and show progress indicators"