BUG CAPTURE — minimal repro pack (no code edits)

Steps:
1) Create a bug template file:
   - If `artifacts/bug-report.md` exists, create `artifacts/bug-report-$(date -u +"%Y%m%d-%H%MZ").md`
   - Else create `artifacts/bug-report.md`
   Template fields:
   - Title:
   - URL under test:
   - Expected vs Actual:
   - Repro steps (1..n):
   - Logs (console/SW excerpts):
   - Attach exported HTML report path (if any):
2) Git snapshot:
   - Print `git rev-parse --short HEAD`
   - Print first 20 lines of `git status --porcelain`
3) Context:
   - If `extension/dist/manifest.json` exists, print first 20 lines
4) WAIT for me to fill details—do not edit app code

Reply format:
## RESULTS
- bug file: path
- git: sha + short status
- context: manifest snippet present/not present
READY FOR DETAILS