EXTENSION INVARIANTS
- No manifest.content_scripts in source or dist.
- Dist service worker is JS and present.
- Dist assets/content.js is IIFE (no top-level import/export).
- E2E tests: Chromium only; never navigate chrome://.
- Default to PLAN (DRY-RUN). Execute only when I say EXECUTE.