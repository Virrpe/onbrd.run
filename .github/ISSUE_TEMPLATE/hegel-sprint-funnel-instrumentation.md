---
name: Hegel Sprint - Funnel Instrumentation
about: Track A - Implement analytics events for user journey tracking
title: '[HEGEL-A] Funnel Instrumentation - Analytics Events'
labels: ['hegel-sprint', 'analytics', 'tracking', 'priority-high']
assignees: ''

---

# Hegel Sprint Track A: Funnel Instrumentation

## Overview
Implement a lightweight, dependency-free event bus to track user journey through the onboarding funnel without locking us into external analytics services.

## Requirements

### Event Bus Implementation
- [ ] Create `site/lib/analytics.ts` with `track(name, payload)` function
- [ ] Events persist to localStorage in dev environment
- [ ] No external network calls in development
- [ ] Minimal footprint, dependency-free

### Events to Track
- [ ] `lp_view` - Landing page view
- [ ] `demo_click` - Landing hero CTA click
- [ ] `audit_start` - Demo "Run Audit" button
- [ ] `signup_start` - Waitlist/signup form start
- [ ] `signup_success` - Successful signup completion
- [ ] `export_click` - Export functionality usage

### Backend Stub
- [ ] Add `/api/v1/analytics/ingest` endpoint (return 501 Not Implemented)
- [ ] Keep client-side logging only in development

### UI Integration Points
- [ ] Landing hero CTA → emit `demo_click`
- [ ] Demo "Run Audit" → emit `audit_start`
- [ ] Waitlist/signup forms → emit `signup_start` / `signup_success`
- [ ] Export functionality → emit `export_click`

## Technical Constraints
- No external analytics dependencies
- MV3 invariants must remain intact
- Site visuals must maintain current design language
- Coverage ratchet thresholds must be maintained (core 62%, backend 22%)

## Acceptance Criteria
- [ ] All 6 events are properly tracked and logged
- [ ] Events are visible in browser console in dev mode
- [ ] No breaking changes to existing flows
- [ ] Tests added for new functionality
- [ ] PR: `feat/probe-funnel-events`

## Definition of Done
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] CI pipeline green
- [ ] No performance regressions
- [ ] Documentation updated

---

**Part of Hegel Sprint: Probe, Don't Commit**