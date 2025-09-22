---
name: Hegel Sprint - Auth Spike
about: Track B - Implement passwordless email authentication
title: '[HEGEL-B] Auth Spike - Passwordless Email'
labels: ['hegel-sprint', 'auth', 'backend', 'priority-high']
assignees: ''

---

# Hegel Sprint Track B: Auth Spike

## Overview
Implement a lightweight passwordless email authentication system to test user engagement without the complexity of traditional auth flows.

## Requirements

### Backend Implementation
- [ ] Create `/api/v1/auth/request` endpoint
  - Accept email address
  - Generate secure 6-digit code
  - Store code with 15-minute expiry
  - Return success response (no actual email sending)

- [ ] Create `/api/v1/auth/verify` endpoint
  - Validate email + code combination
  - Generate JWT token on success
  - Return user session data

### Database Schema
- [ ] Add `auth_codes` table
  - `id`, `email`, `code`, `expires_at`, `used_at`
  - Index on `email`, `expires_at`

- [ ] Add `users` table
  - `id`, `email`, `created_at`, `last_login_at`
  - Unique constraint on `email`

### Frontend Integration
- [ ] Create `/auth` page with email input form
- [ ] Create `/auth/verify` page with code input
- [ ] Add auth context/provider for session management
- [ ] Implement protected route wrapper

### Security Considerations
- [ ] Rate limiting: max 3 attempts per email per hour
- [ ] Code expiry: 15 minutes
- [ ] Secure random code generation
- [ ] JWT token with appropriate claims

### Mock Email Service
- [ ] Log codes to console in development
- [ ] No actual email sending (for this spike)
- [ ] Clear documentation that this is a spike

## Technical Constraints
- Keep existing MV3 invariants intact
- Maintain current design language
- Coverage ratchet thresholds must be maintained
- No external auth dependencies

## Acceptance Criteria
- [ ] User can request auth code with email
- [ ] User can verify with correct code
- [ ] Session persists across page reloads
- [ ] Protected routes work correctly
- [ ] Rate limiting prevents abuse
- [ ] Tests added for new functionality
- [ ] PR: `feat/probe-auth-spike`

## Definition of Done
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] CI pipeline green
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Spike limitations documented

---

**Part of Hegel Sprint: Probe, Don't Commit**