# OnboardingAudit.ai Troubleshooting Guide

## Quick Fix: Refresh & Retry
**If your audit fails, always try this first:**
1. Refresh the page you want to audit
2. Wait 3-5 seconds for the page to fully load
3. Click "Run Audit" again

This resolves 80% of issues by ensuring clean extension state and proper DOM loading.

## Where to Find Logs

### Service Worker Console (Most Important)
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Find "OnboardingAudit.ai" and click **Inspect**
5. Look for logs tagged `[OA][BG]`

### Page Console
1. Open Chrome DevTools on the page you're auditing
2. Go to **Console** tab
3. Look for logs tagged `[OA][CS]`

### Popup Console
1. Right-click the extension icon
2. Select **Inspect popup**
3. Look for logs tagged `[OA][POPUP]`

## Understanding `[OA]` Log Tags

Our logs use consistent tagging:
- `[OA][BG]` - Background script (service worker)
- `[OA][CS]` - Content script (injected into page)
- `[OA][POPUP]` - Extension popup interface

Each log shows:
- **START**: Operation beginning
- **OK**: Operation successful
- **ERROR**: Operation failed

## Expected Successful Audit Flow

Watch for this sequence in logs:

```
[OA][BG] START: Starting deterministic handshake...
[OA][BG] OK: Active tab found: 123, https://example.com
[OA][BG] OK: Content script injected successfully
[OA][CS] OK: READY
[OA][BG] OK: PING successful - content script is responsive
[OA][CS] START: Received message: RUN_AUDIT
[OA][CS] OK: Audit completed successfully
[OA][BG] OK: RUN_AUDIT successful - audit data received
[OA][BG] OK: Audit completed successfully: {...}
```

## Common Issues & Solutions

### 1. "Audit timeout - please try refreshing the page and running again"
**Cause**: Content script not responding within 5 seconds
**Solution**: Refresh page and retry. If persistent, check:
- Page has heavy JavaScript/animations
- Browser is under memory pressure
- Extension needs reload (see below)

### 2. "Content script not responding to PING after retry"
**Cause**: Content script injection failed
**Solution**: 
1. Check Chrome DevTools Console for injection errors
2. Try disabling other extensions temporarily
3. Ensure page allows script injection (not chrome:// pages)

### 3. "Extension context invalidated"
**Cause**: Extension was updated or reloaded
**Solution**: Refresh the page - this reloads the extension context

### 4. "No active tab found"
**Cause**: Extension can't access current tab
**Solution**: 
1. Ensure you're on a normal webpage (not chrome:// or extension page)
2. Click on the page to ensure it's active
3. Try opening DevTools first, then run audit

### 5. Audit completes but shows no results
**Cause**: Content script timeout during DOM analysis
**Solution**: 
1. Refresh page and wait longer before clicking "Run Audit"
2. Check for JavaScript errors in page console
3. Try with simpler pages first

## Advanced Debugging

### Check Extension State
1. Go to `chrome://extensions/`
2. Find "OnboardingAudit.ai"
3. Check for errors in **Errors** button
4. Try **Remove** and reinstall if persistent issues

### Test Content Script Injection
1. Open DevTools on target page
2. In Console, type: `window.__OA_READY__`
3. Should return `true` if content script is loaded
4. If `undefined`, content script injection failed

### Manual Content Script Test
1. In DevTools Console, run: `chrome.runtime.sendMessage({type: 'PING'})`
2. Should return: `{ok: true, ts: timestamp}`
3. If no response, messaging is broken

## Performance Tips

- **SPA pages**: Wait 2-3 seconds after navigation before auditing
- **Heavy pages**: Close other tabs to free memory
- **Large DOMs**: Audit may take 10-15 seconds on complex pages
- **Network issues**: Ensure stable internet connection

## Still Having Issues?

1. Collect logs from all three consoles (SW, page, popup)
2. Note exact error messages and timestamps
3. Check if issue persists across different websites
4. Try in Incognito mode with only this extension enabled

Include these logs when reporting issues for fastest resolution.