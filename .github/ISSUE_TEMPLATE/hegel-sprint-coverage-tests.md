---
name: Hegel Sprint - Coverage Tests
about: Track E - Add backend tests to improve coverage from 22% to 27%
title: '[HEGEL-E] DX Guardrails - Backend Coverage +5%'
labels: ['hegel-sprint', 'testing', 'backend', 'coverage', 'priority-medium']
assignees: ''

---

# Hegel Sprint Track E: DX Guardrails

## Overview
Add targeted backend tests to improve coverage from 22% to 27%, focusing on new functionality from the Hegel Sprint.

## Requirements

### Test Coverage Goals
- [ ] Increase backend coverage from 22% to 27% (+5%)
- [ ] Focus on new sprint functionality
- [ ] Maintain existing coverage thresholds
- [ ] No network calls in tests (mock req/res)

### Target Test Areas

#### Auth Endpoints (from Track B)
- [ ] Test `/api/v1/auth/request` endpoint
  - Mock email validation
  - Test code generation logic
  - Verify rate limiting behavior
  - Test error handling

- [ ] Test `/api/v1/auth/verify` endpoint
  - Mock code validation
  - Test JWT token generation
  - Verify session creation
  - Test invalid code scenarios

#### Analytics Endpoints (from Track A)
- [ ] Test `/api/v1/analytics/ingest` endpoint
  - Verify 501 response
  - Test request validation
  - Mock payload processing

#### Intent Endpoints (from Track C)
- [ ] Test `/api/v1/intent/pricing` endpoint
  - Verify 501 response
  - Test request validation
  - Mock intent data handling

#### Rule Packs (from Track D)
- [ ] Test `/api/v1/rules/custom` endpoint
  - Verify pack structure
  - Test probe ID mapping
  - Validate response format

### Test Structure
- [ ] Create tests under `backend/**/__tests__/*`
- [ ] Use Vitest framework
- [ ] Mock all external dependencies
- [ ] No database/network calls
- [ ] Focus on unit tests

### Coverage Requirements
- [ ] Maintain current thresholds (core 62%, backend 22%)
- [ ] Target 27% backend coverage
- [ ] No regression in existing coverage
- [ ] All new code must have tests

## Technical Constraints
- Use existing test infrastructure
- Follow established patterns
- Mock req/res objects
- Avoid external dependencies
- Fast test execution

## Test Examples

```typescript
// Example auth request test
describe('POST /api/v1/auth/request', () => {
  it('should generate auth code for valid email', async () => {
    const mockReq = {
      body: { email: 'test@example.com' }
    };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    
    await authRequestHandler(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'Check console for auth code'
    });
  });
});
```

## Acceptance Criteria
- [ ] Backend coverage increased to 27%
- [ ] All new endpoints have tests
- [ ] No network calls in tests
- [ ] Tests run quickly (< 5s)
- [ ] Coverage report shows improvement
- [ ] PR: `test/ratchet-backend-27`

## Definition of Done
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] CI pipeline green
- [ ] Coverage report updated
- [ ] No test flakiness
- [ ] Documentation updated

---

**Part of Hegel Sprint: Probe, Don't Commit**