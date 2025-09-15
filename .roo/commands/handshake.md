OPERATING MODE: Tool-First. DRY-RUN by default. Do not modify files unless I say "EXECUTE" or I run /exec-handshake.

HANDSHAKE — PLAN ONLY (no tool calls yet)
1) Git Tools → plan to print repoRoot and first 10 lines of `git status --porcelain`.
2) File System → plan to list top-level names at repoRoot (no contents).
3) Knowledge Graph Memory → plan to upsert {kind:"repo", id:repoRoot, lastSeen:nowISO} and decision {repo:repoRoot, key:"toolbox_loaded", value:true}; plan to echo 1 line.
4) Context7 (optional) → plan a single lookup "vite rollupOptions output.format iife content script example"; summarize ≤3 lines; SKIP if unavailable.
5) Codegen (PLAN only; no execution) → plan codemod to rename export `renderReport` -> `render` in packages/report/*; list planned files + short diff summary.
6) Playwright (optional) → plan to either use the Playwright MCP to read document.title from https://example.com, or shell `pnpm -w exec playwright --version`; SKIP if unavailable.

Reply format:
## PLAN
AWAITING EXECUTE
