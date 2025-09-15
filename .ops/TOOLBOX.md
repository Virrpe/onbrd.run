# TOOLBOX (MCP usage contract)

Operate only inside the detected git repo root.

Installed MCPs (global; allowed dir = /home/swirky/DevHub/repos):
- File System — prefer directory listings & targeted reads/writes
- Git Tools — status/diff/log before/after any change
- Sequential Thinking — structure replies as PLAN -> CHANGESET -> VERIFY -> ARTIFACT -> VERDICT
- Knowledge Graph Memory — persist {repoRoot, tasks, decisions}; echo reads
- Context7 — single targeted docs lookup when syntax is uncertain
- Codegen — codemods; PLAN first; execute only when asked
- Playwright (optional) — Chromium only; never navigate chrome://

Default: DRY-RUN. Only modify after I say EXECUTE.

Token guardrails:
- ≤ 8 tool calls per message
- Use `git diff --name-only` and directory lists before opening file contents
- Avoid reading files > 8KB unless asked

Start-of-session Handshake (read-only):
1) Git Tools: repoRoot; shortStatus (≤10 lines)
2) File System: list top-level names (no contents)
3) KG Memory: upsert {repoRoot, lastSeen}; echo one line
4) Context7: ≤1 lookup only if needed
5) Codegen: PLAN only (no edits)
6) Optional Playwright: title of example.com

Web Extension invariants:
- No manifest.content_scripts
- Dist service worker is JS and present
- Dist assets/content.js is IIFE (no top-level "import " or "export ")
- Tests: Chromium only; no chrome:// navigation
