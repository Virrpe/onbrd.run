# Known Issues & Limitations

## SPA Debounce Behavior
**Issue**: Single-page applications with heavy client-side routing may trigger multiple audits during navigation.

**Workaround**: 
- Wait 2-3 seconds after navigation completes before clicking "Capture now"
- Use manual refresh if needed to ensure DOM stability
- We're implementing smart debouncing in a future release

## Automation Flakiness
**Issue**: Playwright tests may occasionally fail due to timing variations in extension loading and DOM mutations.

**Symptoms**:
- Tests pass locally but fail in CI
- Intermittent timeouts during extension interaction
- Race conditions between page load and audit completion

**Mitigation**:
- Tests use extended timeouts (30s default)
- Retry logic implemented for critical assertions
- Manual verification recommended for release builds

## Dynamic Content Detection
**Issue**: Content loaded after initial page render (AJAX, lazy loading) may not be captured consistently.

**Current Behavior**:
- MutationObserver detects DOM changes within 5 seconds
- Network idle detection waits for 2 seconds of no activity
- Some complex animations may complete after audit finishes

## Extension Permissions
**Note**: Host permissions have been removed for MVP to minimize security footprint. This means:
- Extension only works on currently active tab
- No cross-origin requests without user interaction
- Backend proxy will be added in future release for public page auditing

## Browser Compatibility
**Tested On**:
- Chrome 120+ (primary target)
- Edge 120+ (Chromium-based)
- Brave 1.60+ (Chromium-based)

**Not Supported**:
- Firefox (Manifest V3 differences)
- Safari (WebExtension API gaps)
- Mobile browsers

## Performance Notes
- Audit typically completes in 5-15 seconds
- Memory usage: ~10-20MB during audit
- No persistent background processes
- IndexedDB storage: ~50KB per audit