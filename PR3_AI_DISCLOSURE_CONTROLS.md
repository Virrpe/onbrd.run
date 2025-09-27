# PR 3: AI Disclosure & Controls

## Summary
This PR implements comprehensive AI privacy controls with explicit user opt-in and clear disclosure about data transmission when AI features are enabled.

## Changes Made

### 1. Configuration Updates (`extension/src/config.ts`)
- Added `AI_ENABLED = false` flag (disabled by default)
- Added `AI_DISCLOSURE_TEXT` with clear explanation of data transmission

### 2. AI Gate System (`extension/src/ai/gate.ts`)
- Created `assertAIEnabled()` function that throws `AIDisabledError` when AI is disabled
- Added `isAIEnabled()` utility function for checking status
- Added `getAIDisclosureText()` for UI disclosure copy
- Custom `AIDisabledError` class for proper error handling

### 3. AI Client (`extension/src/ai/client.ts`)
- Created `AIClient` class with built-in privacy controls
- All AI methods call `assertAIEnabled()` before making requests
- Includes `analyzeContent()` and `generateInsights()` methods
- Proper error handling for disabled AI state

### 4. UI Updates (`extension/src/popup/App.svelte`)
- Added AI opt-in toggle with clear disclosure text
- Updated storage to persist AI preference (`ai_opt_in`)
- Added visual section with disclosure about cloud data transmission
- Updated analytics tracking to include AI opt-in status

### 5. Storage Integration
- Extension now stores AI preference in `chrome.storage.sync`
- Default state: AI disabled (opt-in required)
- Preference persists across browser sessions

## Privacy Features

### Data Disclosure
When AI is enabled, users see clear text:
> "When enabled, AI features send page content to cloud services for analysis. This includes text, structure, and metadata from the audited page. AI insights provide enhanced recommendations but require internet connectivity."

### Opt-in Requirements
- AI features are **disabled by default**
- Users must explicitly check the "Enable AI insights" toggle
- No AI calls are made without user consent
- All AI functionality throws `AIDisabledError` when disabled

### Error Handling
- Attempting AI calls when disabled throws descriptive errors
- Errors clearly indicate AI is disabled and how to enable
- No silent failures or unexpected behavior

## Testing

### Verification Tests
Created comprehensive test suite (`extension/src/ai/test-gate.ts`) that verifies:
- AI is disabled by default
- `assertAIEnabled()` throws `AIDisabledError` when disabled
- AI client methods throw appropriate errors when disabled
- Error messages are user-friendly and actionable

### Test Results
```
✓ AI Enabled by default: false
✓ assertAIEnabled correctly threw AIDisabledError
✓ AI client correctly threw AIDisabledError
✓ generateInsights correctly threw AIDisabledError
```

## Usage

### For Developers
```typescript
import { assertAIEnabled } from './ai/gate';
import { createAIClient } from './ai/client';

// Always check AI is enabled before making AI calls
assertAIEnabled();

const aiClient = createAIClient('https://api.example.com');
const insights = await aiClient.generateInsights(pageContent);
```

### For Users
1. Open extension popup
2. See "Enable AI insights" toggle (disabled by default)
3. Read disclosure about data transmission
4. Opt-in by checking the toggle
5. AI features become available

## Security & Privacy
- Zero AI calls without explicit user consent
- Clear disclosure of all data transmitted
- No background AI processing
- User can disable AI at any time via popup toggle
- All preferences stored locally in browser storage

## Files Created/Modified
- `extension/src/config.ts` - Added AI configuration
- `extension/src/ai/gate.ts` - AI access control
- `extension/src/ai/client.ts` - AI client with privacy controls
- `extension/src/popup/App.svelte` - UI with opt-in toggle
- `extension/src/lib/paywall.svelte` - Paywall component (fixed import)
- `extension/src/ai/test-gate.ts` - Test verification

## Breaking Changes
None - this is a new feature that doesn't affect existing functionality.

## Migration
No migration needed - new installations will have AI disabled by default.