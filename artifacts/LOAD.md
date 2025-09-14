# Chrome Extension Loading Instructions

## ⚠️ CRITICAL: Load the CORRECT Folder

**DO NOT load the `extension/` folder directly!** This will cause "Invalid script mime type" errors.

## Step-by-Step Loading Process

### 1. Remove Existing Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Find any existing "OnboardingAudit.ai" extension
3. Click "Remove" to uninstall it completely
4. **Important**: If you see any errors in the service worker, the wrong folder was loaded

### 2. Build the Extension
```bash
pnpm run build
```

### 3. Load the Built Extension
1. In `chrome://extensions/`, enable "Developer mode" (toggle in top right)
2. Click "Load unpacked"
3. **Select the `extension/dist/` folder** (NOT the `extension/` folder)
4. The extension should appear in your extensions list

### 4. Verify Installation
1. Check that the extension shows version **1.0.1** (not 1.0.0)
2. Click "Service worker" link under the extension
3. **Console should show NO errors** (especially no "Invalid script mime type")
4. If you see errors, you loaded the wrong folder - remove and try again

### 5. Test Programmatic Injection
1. Navigate to any website (e.g., https://example.com)
2. Click the OnboardingAudit.ai extension icon in the toolbar
3. The content script should be injected programmatically (no content_scripts in manifest)
4. Open the popup and click "Capture Now" to test the full flow

### 6. Confirm Manifest Configuration
1. In `chrome://extensions/`, click "Details" for OnboardingAudit.ai
2. Open `extension/dist/manifest.json` in your code editor
3. Verify **no `content_scripts` block exists** (programmatic injection)
4. Verify no `.ts` references exist anywhere in the manifest
5. Verify `background.service_worker` is set to `"service-worker.js"`
6. Verify `service-worker.js` exists in the dist folder
7. Verify `assets/content.js` exists in the dist folder

## Troubleshooting

### "Invalid script mime type" error
- **Cause**: You loaded `extension/` instead of `extension/dist/`
- **Fix**: Remove extension, run `pnpm run build`, load `extension/dist/`

### Content script not injecting
- **Cause**: Missing permissions or build issues
- **Fix**: Check that manifest includes `"scripting"` and `"activeTab"` permissions

### Version not updated
- **Cause**: Extension cached old version
- **Fix**: Remove extension completely and reload from `extension/dist/`

### Build errors
- **Cause**: TypeScript or dependency issues
- **Fix**: Run `pnpm install` then `pnpm run build`

## Quick Verification Checklist
- [ ] Loaded `extension/dist/` folder (not `extension/`)
- [ ] Version shows 1.0.1 in chrome://extensions/
- [ ] No "Invalid script mime type" errors
- [ ] Service worker console is clean
- [ ] dist/manifest.json contains **no content_scripts block**
- [ ] dist/manifest.json contains no `.ts` references
- [ ] Clicking extension icon injects content script programmatically
- [ ] "Capture Now" button works from popup