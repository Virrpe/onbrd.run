# Hegel Sprint Metrics - DOM Hook Points

This document outlines the DOM hook points for analytics tracking in the OnboardingAudit.ai funnel instrumentation system.

## Track A: Funnel Instrumentation

### Event Tracking Implementation

The analytics system uses feature flags to control event tracking. Events are only tracked when `featureFlags.analytics === true`.

### DOM Hook Points

#### 1. Landing Page View (`lp_view`)
**Location**: [`site/index.html`](site/index.html:485)
**Trigger**: `window.addEventListener('load', ...)`
**Selector**: N/A (page load event)
**Notes**: Fired when the landing page loads

#### 2. Demo Click (`demo_click`)
**Location**: [`site/index.html`](site/index.html:495)
**Trigger**: `document.addEventListener('click', ...)`
**Selector**: `a[href*="demo"], a[href*="/demo"]`
**Notes**: Tracks clicks on hero CTA buttons that link to demo page

#### 3. Audit Start (`audit_start`)
**Location**: [`extension/src/popup/App.svelte`](extension/src/popup/App.svelte:39)
**Trigger**: `runAudit()` function call
**Selector**: N/A (function call)
**Notes**: Fired when user clicks "Run Audit" button in extension popup

#### 4. Signup Start (`signup_start`)
**Location**: [`site/index.html`](site/index.html:515)
**Trigger**: `document.addEventListener('click', ...)`
**Selector**: `a[href^="mailto:"]` (specifically `hello@onbrd.run`)
**Notes**: Tracks waitlist/subscribe form submissions. Email is hashed in payload for privacy.

#### 5. Signup Success (`signup_success`)
**Location**: [`site/index.html`](site/index.html:525)
**Trigger**: `setTimeout(..., 1000)` after signup start
**Selector**: N/A (delayed callback)
**Notes**: Fired 1 second after signup start to simulate form submission success

#### 6. Export Click (`export_click`)
**Locations**: 
- [`site/index.html`](site/index.html:535) - Landing page downloads
- [`extension/src/popup/App.svelte`](extension/src/popup/App.svelte:59) - Extension HTML export
**Trigger**: `document.addEventListener('click', ...)` / `exportHtml()` function
**Selector**: `a[download], [href*="download"], [href*=".zip"], [href*=".html"]`
**Notes**: Tracks any export/download action including extension downloads and HTML report exports

### Feature Flag Integration

The analytics system integrates with the feature flag system:

```typescript
// Check if analytics is enabled
if (isFeatureEnabled('ANALYTICS_EVENTS')) {
  await track(EVENT_NAMES.LP_VIEW);
}
```

### LocalStorage Persistence

In development/preview environments, events are persisted to localStorage under the key `onbrd.events` for debugging purposes.

### Debug Mode

When `process.env.NODE_ENV === 'development'`, analytics events are logged to the console for debugging.

### Error Handling

All analytics calls are wrapped in try-catch blocks to prevent errors from breaking the user experience:

```typescript
try {
  await track(EVENT_NAMES.DEMO_CLICK);
} catch (error) {
  console.warn('Analytics tracking failed:', error);
}
```

### Extension Context

For the extension popup, analytics initialization is handled dynamically:

```typescript
// Check if analytics is enabled via feature flag
const analyticsModule = await import('../../../site/lib/analytics.ts');
trackEvent = analyticsModule.track;
eventNames = analyticsModule.EVENT_NAMES;
```

## Testing

Use the [`test-analytics.html`](test-analytics.html) file to test analytics functionality:

1. Open `test-analytics.html` in a browser
2. Click "Test Feature Flag" to enable analytics
3. Click "Test Track Event" to verify event tracking
4. Click "View Stored Events" to see tracked events in localStorage
5. Click "Clear Events" to reset the event store

## Implementation Status

- ✅ Landing page view tracking
- ✅ Demo click tracking  
- ✅ Audit start tracking
- ✅ Signup start tracking
- ✅ Signup success tracking
- ✅ Export click tracking
- ✅ Feature flag integration
- ✅ LocalStorage persistence (dev/preview only)
- ✅ Error handling and debug mode
- ✅ Extension popup integration