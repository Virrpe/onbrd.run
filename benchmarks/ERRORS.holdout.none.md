# Error Analysis Report

Generated: 2025-09-27T09:07:24.892Z
Results: benchmarks/results.holdout.none.json

## Summary

- Total benchmarks analyzed: 66
- Total errors detected: 48
- Error rate: 14.5%

## Per-Check Performance

### h_cta_above_fold

- Precision: 85.2%
- Recall: 96.3%
- F1: 90.4%
- True Positives: 52
- False Positives: 9
- True Negatives: 3
- False Negatives: 2


### h_steps_count

- Precision: 98.4%
- Recall: 96.9%
- F1: 97.6%
- True Positives: 62
- False Positives: 1
- True Negatives: 1
- False Negatives: 2


### h_copy_clarity

- Precision: 100.0%
- Recall: 100.0%
- F1: 100.0%
- True Positives: 64
- False Positives: 0
- True Negatives: 2
- False Negatives: 0


### h_trust_markers

- Precision: 82.8%
- Recall: 88.9%
- F1: 85.7%
- True Positives: 48
- False Positives: 10
- True Negatives: 2
- False Negatives: 6


### h_perceived_signup_speed

- Precision: 97.9%
- Recall: 73.4%
- F1: 83.9%
- True Positives: 47
- False Positives: 1
- True Negatives: 1
- False Negatives: 17



## Top Errors by Category

### enterprise (17 errors, 141.7% error rate)

#### False Positives (5)
- **Compliance Verification**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 62.7345)
- **Compliance Verification**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 62.7345)
- **Enterprise Multi-User Setup**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 61.946799999999996)
- **Enterprise Multi-User Setup**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 61.946799999999996)
- **Holdout: Enterprise Compliance Setup**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 42.2543)

#### False Negatives (12)
- **Compliance Verification**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 62.7345)
- **Enterprise Multi-User Setup**: Steps not counted properly (possibly complex flow or missing indicators) (score: 61.946799999999996)
- **Enterprise Multi-User Setup**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 61.946799999999996)
- **Holdout: Enterprise Compliance Setup**: Steps not counted properly (possibly complex flow or missing indicators) (score: 42.2543)
- **Holdout: Enterprise Compliance Setup**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 42.2543)


### saas (11 errors, 78.6% error rate)

#### False Positives (6)
- **Holdout: SaaS Custom Workflow Builder**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 66.673)
- **Holdout: SaaS Custom Workflow Builder**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 66.673)
- **Holdout: SaaS Enterprise Configuration**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 66.673)
- **Holdout: SaaS Enterprise Configuration**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 66.673)
- **Holdout: SaaS Security Configuration**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 68.24839999999999)

#### False Negatives (5)
- **Holdout: SaaS Analytics Dashboard Setup**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 69.82379999999999)
- **Holdout: SaaS Custom Workflow Builder**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 66.673)
- **Holdout: SaaS Enterprise Configuration**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 66.673)
- **Holdout: SaaS Onboarding Wizard**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 71.3992)
- **Holdout: SaaS Security Configuration**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 68.24839999999999)


### basic-signup (9 errors, 56.3% error rate)

#### False Positives (6)
- **Holdout: CTA Below Fold**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 61.946799999999996)
- **Holdout: Long Comprehensive Form**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 74.55)
- **Holdout: Long Comprehensive Form**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 74.55)
- **Holdout: Poor Copy Quality**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 63.5222)
- **Holdout: Poor Copy Quality**: Too many steps detected (possibly counting navigation or decorative elements) (score: 63.5222)

#### False Negatives (3)
- **Holdout: Long Comprehensive Form**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 74.55)
- **Holdout: Minimal Form Design**: Trust markers not detected (possibly subtle indicators or missing elements) (score: 72.1869)
- **Holdout: Simple Email Signup**: Trust markers not detected (possibly subtle indicators or missing elements) (score: 72.1869)


### ecommerce (7 errors, 58.3% error rate)

#### False Positives (4)
- **Holdout: Ecommerce Account Creation Checkout**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 71.3992)
- **Holdout: Ecommerce Account Creation Checkout**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 71.3992)
- **Holdout: Ecommerce Compliance Verification**: CTA detected above fold but shouldn't be (possibly decorative element or wrong threshold) (score: 74.55)
- **Holdout: Ecommerce Compliance Verification**: Trust markers detected but shouldn't be (possibly decorative icons or false positives) (score: 74.55)

#### False Negatives (3)
- **Account Creation During Checkout**: CTA not detected above fold but should be (possibly below threshold or hidden) (score: 50.919)
- **Holdout: Ecommerce Account Creation Checkout**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 71.3992)
- **Holdout: Ecommerce Multi-Step Checkout**: Signup speed issues missed (possibly long forms or missing time indicators) (score: 71.3992)


### mobile (4 errors, 33.3% error rate)

#### False Positives (0)


#### False Negatives (4)
- **Holdout: Mobile Dark Mode**: Trust markers not detected (possibly subtle indicators or missing elements) (score: 72.1869)
- **Holdout: Mobile Location Permissions**: Trust markers not detected (possibly subtle indicators or missing elements) (score: 72.1869)
- **Holdout: Mobile Interactive Tutorial**: Trust markers not detected (possibly subtle indicators or missing elements) (score: 63.5222)
- **Mobile App Tutorial**: Trust markers not detected (possibly subtle indicators or missing elements) (score: 66.673)



## Recommendations for v0.2.c Improvements

Based on this error analysis, focus on:

1. **h_cta_above_fold**: 9 false positives, 2 false negatives
   - Focus on reducing false positives

2. **h_trust_markers**: 10 false positives, 6 false negatives
   - Focus on reducing false positives

3. **Overall**: Target the categories with highest error rates for heuristic improvements.
