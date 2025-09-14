# Onboarding Audit: {{page_name}}

**URL**: {{url}}
**Audit Score**: {{score}}/100
**Priority**: {{priority}}
**Detected Issues**: {{issue_count}}

## Critical Issues Found
{{#each issues}}
### {{heuristic}} ({{score}}/100)
**Issue**: {{description}}
**Impact**: {{impact}}
**Fix**: {{recommendation}}
**Effort**: {{effort}}
{{/each}}

## Implementation Notes
- **Estimated Time**: {{estimated_hours}} hours
- **Dependencies**: {{dependencies}}
- **Testing Required**: Cross-browser compatibility, mobile responsiveness

## Acceptance Criteria
- [ ] All identified issues resolved
- [ ] Heuristic scores improved by {{target_improvement}} points
- [ ] User testing confirms improved onboarding flow
- [ ] No regression in conversion metrics

## Resources
- **Full Audit Report**: {{report_url}}
- **Design Mockups**: {{design_url}}
- **Benchmark Data**: {{benchmark_url}}

---

*Created via OnboardingAudit.ai integration*