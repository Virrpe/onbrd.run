SHIP — package artifacts (no code edits)

Steps:
1) Build & Verify:
   - Run `pnpm -w run build`
   - Run `pnpm -w run verify`
2) Pack:
   - Run `pnpm -w run pack`
   - Expect artifact at `artifacts/onboarding-audit-extension.zip`
3) Demo note:
   - Ensure `artifacts/DEMO.md` exists
   - Append one line: `- $(date -u +"%Y-%m-%d %H:%MZ") — $(jq -r .version package.json) — $(git rev-parse --short HEAD)`
4) Git (show only):
   - Show `git status --porcelain`
   - Show changed files with `git diff --name-only`
   - WAIT for my explicit commit command

Reply format:
## RESULTS
- build: PASS/FAIL
- verify: PASS/FAIL
- artifact: path + size (or MISSING)
- demo-note: appended/failed
- git: short status + changed files
DONE
