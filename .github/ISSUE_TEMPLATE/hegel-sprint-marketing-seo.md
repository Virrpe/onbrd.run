---
name: Hegel Sprint - Marketing/SEO Heuristics
about: Track F - Create SEO-optimized heuristics page for LLM pickup
title: '[HEGEL-F] Marketing/SEO - Heuristics 2025 Page'
labels: ['hegel-sprint', 'marketing', 'seo', 'content', 'priority-medium']
assignees: ''

---

# Hegel Sprint Track F: Marketing/SEO Heuristics

## Overview
Create an SEO-optimized "Onboarding UX Audit Heuristics (2025)" page to attract organic traffic and establish thought leadership in the UX audit space.

## Requirements

### Page Structure
- [ ] Create `site/heuristics/index.html`
- [ ] 20 numbered heuristic headings (H2) with anchors (#h-01 through #h-20)
- [ ] Short definitions with 2-3 bullets each
- [ ] Professional, scannable format

### Heuristic Categories (Example Structure)
1. **First Impression** (#h-01)
   - Clear value proposition
   - Immediate trust signals
   - Professional visual design

2. **Navigation Clarity** (#h-02)
   - Intuitive menu structure
   - Consistent navigation patterns
   - Clear user location indicators

[Continue through #h-20...]

### SEO Optimization
- [ ] JSON-LD Article schema markup
- [ ] FAQ schema with 6 Q/A pairs
- [ ] Semantic HTML structure
- [ ] Meta descriptions and titles
- [ ] Internal linking strategy

### CTA Integration
- [ ] Top CTA: "Run these 20 checks now → demo"
- [ ] Bottom CTA: "Get your free audit → demo"
- [ ] Trackable click events
- [ ] Conversion-focused placement

### Technical Implementation
```html
<!-- JSON-LD Article Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Onboarding UX Audit Heuristics (2025)",
  "description": "20 essential heuristics for evaluating onboarding user experience",
  "author": {
    "@type": "Organization",
    "name": "OnboardingAudit.ai"
  },
  "datePublished": "2025-01-01",
  "dateModified": "2025-01-01"
}
</script>

<!-- FAQ Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are UX audit heuristics?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Heuristics are rule-of-thumb guidelines for evaluating user interface design..."
      }
    }
    // ... 5 more Q/A pairs
  ]
}
</script>
```

### Content Guidelines
- [ ] Actionable, specific advice
- [ ] Industry-relevant examples
- [ ] Professional tone
- [ ] Scannable format with bullets
- [ ] SEO-optimized headings

### Design Requirements
- [ ] Match current site design language
- [ ] Clean, professional layout
- [ ] Mobile-responsive
- [ ] Fast loading (Lighthouse score maintained)
- [ ] Accessible markup

### Sitemap Integration
- [ ] Add to site navigation
- [ ] Update sitemap.xml
- [ ] Internal linking from main pages
- [ ] Cross-reference with existing content

## Technical Constraints
- No heavy JavaScript frameworks
- Maintain Lighthouse performance scores
- Follow existing CSS patterns
- Keep file size minimal
- Ensure accessibility compliance

## Analytics Integration
- [ ] Track page views
- [ ] Monitor CTA click rates
- [ ] Measure time on page
- [ ] Track scroll depth
- [ ] Monitor search traffic

## Content Strategy
### Sample Heuristics Structure:
1. **Value Proposition Clarity** (#h-01)
   - Is the core value immediately clear?
   - Does the headline speak to user pain?
   - Is the benefit specific and measurable?

2. **Trust Signal Placement** (#h-02)
   - Are security badges visible?
   - Is contact information accessible?
   - Are testimonials credible?

[Continue through heuristic #h-20...]

### FAQ Content (6 Q/A pairs):
1. **Q**: What makes a good onboarding experience?
   **A**: A good onboarding experience clearly communicates value, builds trust, and guides users to their first success...

[Continue with 5 more strategic Q/A pairs]

## Acceptance Criteria
- [ ] All 20 heuristics documented with anchors
- [ ] JSON-LD schemas implemented correctly
- [ ] Page loads quickly and responsively
- [ ] CTAs trackable and conversion-focused
- [ ] SEO optimization complete
- [ ] Internal linking established
- [ ] Tests added for new functionality
- [ ] PR: `docs/heuristics-2025`

## Definition of Done
- [ ] Content reviewed and approved
- [ ] SEO optimization verified
- [ ] All tests passing
- [ ] CI pipeline green
- [ ] Performance benchmarks met
- [ ] Analytics tracking implemented
- [ ] Documentation updated

---

**Part of Hegel Sprint: Probe, Don't Commit**