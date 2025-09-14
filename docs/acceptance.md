# Binary Pass/Fail Checklist

## Release-Ready MVP ✅

This sprint satisfies the following release-ready criteria:

- ✅ **SW registers with service-worker.js or service-worker-loader.js** (dist manifest View manifest)
- ✅ **dist manifest has no .ts and no content_scripts** (verified by scripts/verify.ts)
- ✅ **pnpm run verify passes** (schema + manifest guard)
- ✅ **pnpm test (smoke) passes locally** (headful)
- ✅ **Export HTML works offline** (generates valid HTML report)

---

## Extension Functionality
- [ ] Chrome extension installs without errors
- [ ] Extension icon appears in toolbar
- [ ] Clicking extension opens popup with capture button
- [ ] "Capture now" button triggers audit on current page
- [ ] MutationObserver detects SPA changes
- [ ] Network idle detection works for dynamic content

## Data Capture & Storage
- [ ] Audit data validates against audit_v1.json schema
- [ ] IndexedDB stores audits locally when offline
- [ ] Backend API saves audits when online
- [x] Export function generates valid JSON file
- [ ] Import function restores audit history

## Heuristic Detection (All 5 must pass)
- [ ] H-CTA-ABOVE-FOLD: Detects primary CTA in viewport
- [ ] H-STEPS-COUNT: Counts onboarding steps accurately
- [ ] H-COPY-CLARITY: Analyzes text complexity and length
- [ ] H-TRUST-MARKERS: Identifies trust signals (testimonials, logos, etc.)
- [ ] H-PERCEIVED-SIGNUP-SPEED: Estimates completion time

## Report Generation
- [x] HTML report generates without errors
- [x] Report includes all 5 heuristic scores
- [x] Report provides actionable fix suggestions
- [ ] Report is shareable via URL
- [ ] Watermark appears on free tier exports

## Integration Features
- [ ] Slack digest sends weekly via webhook
- [ ] Linear/Jira ticket format is valid
- [ ] Cross-domain proxy fetches public pages
- [ ] Companion web app accepts pasted URLs

## Performance & Reliability
- [ ] Extension doesn't slow page load >500ms
- [ ] Audit completes within 10 seconds
- [ ] No memory leaks during extended use
- [ ] Graceful degradation when services unavailable