TOOL-FIRST TASK — DRY-RUN unless I say EXECUTE.

Use MCPs: Git Tools, File System, Sequential Thinking, Knowledge Graph Memory, Context7, Codegen, Playwright (optional).
Write scope: only inside repoRoot; prefer targeted reads; max 8 tool calls/message.

Extension invariants:
- No manifest.content_scripts.
- Dist service worker must be built JS and present.
- Dist assets/content.js must be IIFE (no top-level "import " or "export ").
- Tests: Chromium only; no chrome:// navigation.

Reply format:
## PLAN
## CHANGESET   (only after EXECUTE; show diffs/codemod plan)
## VERIFY      (commands + expected pass signals)
## ARTIFACT    (paths produced)
## VERDICT     (map to acceptance; next actions)
