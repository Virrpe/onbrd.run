# Playwright Smoke Test Plan

## Test Environment Setup
- Browser: Chrome/Chromium
- Viewport: 1920x1080
- Network: Throttled to 3G for realistic conditions

## Core Flow Tests
1. **Extension Installation**
   - Load unpacked extension
   - Verify manifest loads without errors
   - Check extension icon appears

2. **Basic Capture Flow**
   - Navigate to test onboarding page
   - Click extension icon
   - Trigger "Capture now" button
   - Verify audit completes within 10 seconds

3. **Heuristic Detection**
   - Test page with known CTA position
   - Test multi-step onboarding flow
   - Test copy clarity on complex text
   - Test trust markers presence
   - Test signup speed estimation

4. **Data Validation**
   - Export audit as JSON
   - Validate against audit_v1.json schema
   - Import exported audit
   - Verify data integrity

5. **Report Generation**
   - Generate HTML report
   - Verify all 5 heuristics scored
   - Check recommendations present
   - Validate shareable URL works

6. **Cross-Domain Testing**
   - Test proxy fetch on public page
   - Verify CORS handling
   - Test authentication flow

7. **Error Handling**
   - Test offline mode behavior
   - Test network timeout handling
   - Test invalid page structure
   - Test extension update scenario

## Success Criteria
- All tests pass without errors
- Performance metrics within acceptable ranges
- No memory leaks detected
- Cross-browser compatibility verified