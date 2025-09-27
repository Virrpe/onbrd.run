# OnboardingAudit.ai Benchmarks

A comprehensive benchmark suite for evaluating onboarding flow quality using deterministic scoring algorithms.

## Overview

This benchmark suite provides a standardized way to measure and compare the quality of user onboarding experiences across different websites and applications. Each benchmark represents a specific onboarding flow scenario with predefined heuristics that are scored using our deterministic scoring system.

## Pilot Corpus

The pilot corpus consists of 25 carefully curated onboarding flow fixtures that represent common patterns found in modern web applications:

### Flow Categories

1. **Basic Signup Flows** (5 fixtures)
   - Simple email/password registration
   - Social login integration
   - Minimal form designs
   - Progressive disclosure patterns

2. **SaaS Onboarding** (8 fixtures)
   - Multi-step wizard flows
   - Feature tour integrations
   - Team invitation processes
   - Payment integration flows

3. **E-commerce Checkout** (6 fixtures)
   - Guest checkout flows
   - Account creation during purchase
   - Payment method selection
   - Shipping address collection

4. **Mobile App Onboarding** (3 fixtures)
   - Permission request flows
   - Tutorial sequences
   - Profile setup processes

5. **Enterprise/B2B** (3 fixtures)
   - Multi-user account setup
   - Integration configuration
   - Compliance verification flows

## Usage

### Running Benchmarks

```bash
# Run all benchmarks
node scripts/run-benchmarks.mjs

# Run specific category
node scripts/run-benchmarks.mjs --category saas

# Run with custom seed for reproducible results
node scripts/run-benchmarks.mjs --seed 12345

# Run with verbose output
node scripts/run-benchmarks.mjs --verbose
```

### Benchmark Structure

Each benchmark fixture is a JSON file containing:

```json
{
  "id": "signup-basic",
  "name": "Basic Signup Flow",
  "category": "basic-signup",
  "description": "Simple email/password registration with minimal friction",
  "url": "https://example.com/signup",
  "heuristics": {
    "h_cta_above_fold": {
      "detected": true,
      "position": 150,
      "element": "button.signup-primary"
    },
    "h_steps_count": {
      "total": 2,
      "forms": 1,
      "screens": 1
    },
    "h_copy_clarity": {
      "avg_sentence_length": 8,
      "passive_voice_ratio": 5,
      "jargon_density": 2
    },
    "h_trust_markers": {
      "testimonials": 0,
      "security_badges": 1,
      "customer_logos": 0,
      "total": 1
    },
    "h_perceived_signup_speed": {
      "form_fields": 3,
      "required_fields": 2,
      "estimated_seconds": 25
    }
  },
  "expected_score_range": [75, 95],
  "notes": "Clean, minimal design with clear value proposition"
}
```

### Scoring System

Benchmarks use our deterministic scoring algorithm with the following weights:

- **H-CTA-ABOVE-FOLD**: 25% - Call-to-action visibility above the fold
- **H-STEPS-COUNT**: 20% - Number of steps in the onboarding process
- **H-COPY-CLARITY**: 20% - Readability and clarity of copy
- **H-TRUST-MARKERS**: 20% - Presence of trust-building elements
- **H-PERCEIVED-SIGNUP-SPEED**: 15% - Estimated time to complete signup

### Deterministic Scoring

All benchmarks use a seeded random number generator and fixed timestamps to ensure reproducible results:

- **Seed**: 12345 (configurable)
- **Fixed timestamp**: 2021-01-01T00:00:00.000Z
- **Deterministic PRNG**: Linear congruential generator

### Results Format

Benchmark results are saved to `benchmarks/results.json`:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "seed": 12345,
  "total_benchmarks": 25,
  "summary": {
    "average_score": 72.4,
    "median_score": 75,
    "min_score": 45,
    "max_score": 95
  },
  "results": [
    {
      "id": "signup-basic",
      "score": 85,
      "individual_scores": {
        "h_cta_above_fold": 100,
        "h_steps_count": 100,
        "h_copy_clarity": 95,
        "h_trust_markers": 60,
        "h_perceived_signup_speed": 80
      },
      "issues": [
        "Only 1 trust signals detected, which may reduce user confidence"
      ],
      "recommendations": [
        {
          "heuristic": "h_trust_markers",
          "priority": "medium",
          "description": "Only 1 trust signals detected, which may reduce user confidence",
          "fix": "Add testimonials, security badges, or customer logos"
        }
      ]
    }
  ]
}
```

## Adding New Benchmarks

To add a new benchmark fixture:

1. Create a new JSON file in `benchmarks/corpus/`
2. Follow the structure shown above
3. Include realistic heuristic values based on actual flow analysis
4. Add expected score range based on manual calculation
5. Include descriptive notes about the flow characteristics

## Validation

Each benchmark is validated to ensure:

- All required heuristics are present
- Score ranges are realistic (0-100)
- Individual heuristic scores align with overall score
- Results are reproducible across multiple runs

## Performance Metrics

The benchmark suite tracks:

- **Execution time**: Time to run all benchmarks
- **Memory usage**: Peak memory consumption during scoring
- **Score variance**: Consistency across multiple runs
- **Validation errors**: Issues with benchmark fixtures

## Contributing

When contributing new benchmarks:

1. Ensure fixtures represent real-world onboarding flows
2. Include comprehensive heuristic data
3. Validate expected score ranges manually
4. Test for deterministic results
5. Document any special considerations

## License

This benchmark suite is part of the OnboardingAudit.ai project and follows the same licensing terms.