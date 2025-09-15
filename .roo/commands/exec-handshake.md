MCP HEALTHCHECK — EXECUTE (no repo writes)

Run with hard caps: ≤7 tool calls total. If a step/tool is unavailable, print SKIPPED:<reason> and continue.

Steps:
1) Git Tools → print repoRoot = `git rev-parse --show-toplevel`, and first 10 lines of `git status --porcelain`.
2) File System → list top-level names at repoRoot (names only).
3) Knowledge Graph Memory → upsert {kind:"repo", id:repoRoot, lastSeen:nowISO} and decision {repo:repoRoot, key:"toolbox_loaded", value:true}; read back and echo one line.
4) Context7 (optional; one call max) → if the Context7 MCP is available, query "vite rollupOptions output.format iife content script example" and summarize in ≤3 lines; else SKIPPED.
5) Codegen (PLAN only; do not change files) → plan codemod to rename export `renderReport` -> `render` in packages/report/*; list planned files + short diff summary.
6) Playwright step (optional):
   - If Playwright MCP tool is available, open https://example.com and return document.title.
   - Else run shell: `pnpm -w exec playwright --version` and print it; if that fails, SKIPPED.

Reply format:
## RESULTS
- repoRoot: …
- topLevel: [...]
- memoryEcho: …
- context7: <summary or SKIPPED>
- codegenPlan: files [...]
- playwright: <title or version or SKIPPED>
DONE
