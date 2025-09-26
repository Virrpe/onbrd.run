#!/bin/bash
set -euo pipefail

BRANCH="chore/claude-evidence-bundle"
git switch -c "$BRANCH" || git switch "$BRANCH"

# 1) Resolve repo state info
REPO_REMOTE=$(git config --get remote.origin.url)
COMMIT_SHA=$(git rev-parse HEAD)
COMMIT_SHORT=$(git rev-parse --short HEAD)
REPO_URL="https://github.com/$(git remote -v | awk '/origin.*(https|git@)/{print $2}' | head -1 | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"

# Helper to make GitHub permalink for file + line range
permalink () {
  local file="$1"; local start="${2:-}"; local end="${3:-}"
  if [[ -z "$start" ]]; then
    echo "${REPO_URL}/blob/${COMMIT_SHA}/${file}"
  else
    echo "${REPO_URL}/blob/${COMMIT_SHA}/${file}#L${start}-L${end:-$start}"
  fi
}

# 2) Run verification commands Claude requested
DET_OUT=$(node scripts/stability_test.mjs || true)
BM_SUMMARY=$(node scripts/run-benchmarks.mjs || true)
BM_HEAD=$(head -60 benchmarks/results.json 2>/dev/null || true)
NET_GREP=$(git grep -nE 'fetch\(|WebSocket|XMLHttpRequest|EventSource' extension/src || true)

# 3) Collect key file snippets (safe, small)
readarray -t SNIPPETS <<'EOF'
extension/src/config.ts:1:120
extension/src/net/guard.ts:1:200
extension/src/popup/App.svelte:1:220
packages/core/src/scoring.ts:1:240
packages/core/src/probes.ts:1:220
packages/report/src/index.ts:1:200
scripts/stability_test.mjs:1:220
scripts/run-benchmarks.mjs:1:220
docs/CLAIMS_EVIDENCE.md:1:200
site/docs/checks.html:1:160
site/docs/scoring.html:1:200
site/docs/benchmarks.html:1:200
site/styles.css:1:200
site/styles/motion.css:1:200
EOF

SNIP_MD=""
for spec in "${SNIPPETS[@]}"; do
  FILE="${spec%%:*}"
  RANGES="${spec#*:}"             # e.g. "1:120"
  START="${RANGES%:*}"
  LINES="${RANGES#*:}"
  if [[ -f "$FILE" ]]; then
    TOTAL=$(wc -l < "$FILE")
    END=$(( START + LINES - 1 ))
    if (( END > TOTAL )); then END=$TOTAL; fi
    LINK=$(permalink "$FILE" "$START" "$END")
    SNIP_MD+="\n\n### ${FILE} \`L${START}-L${END}\`\nPermalink: ${LINK}\n\n\`\`\`${FILE##*.}\n"
    sed -n "${START},${END}p" "$FILE" >> /tmp/snippet.tmp
    cat /tmp/snippet.tmp >> /dev/null # no-op to ensure file exists
    cat /tmp/snippet.tmp >> >(sed 's/\t/  /g') # normalize tabs
    SNIP_MD+="$(sed -n "${START},${END}p" "$FILE")"
    SNIP_MD+="\n\`\`\`\n"
    rm -f /tmp/snippet.tmp || true
  fi
done

# 4) Build evidence markdown
mkdir -p docs
cat > docs/CLAUDE_EVIDENCE.md <<EOF
# Onbrd Evidence Bundle for Claude
Commit: \`${COMMIT_SHORT}\` • Repo: \`${REPO_URL}\`

This page aggregates **verifiable** code snippets, command outputs, and **GitHub permalinks** to support a dialectical audit of 7 claims (determinism, local-first guard, AI gating, benchmarks, report metadata, site copy, premium polish).

> **How to cite:** Use the permalinks next to each snippet. All outputs below were generated from this commit.

---

## 1) Determinism Test Output
**Command:** \`node scripts/stability_test.mjs\`
**Permalink:** $(permalink scripts/stability_test.mjs)

\`\`\`txt
${DET_OUT}
\`\`\`

---

## 2) Benchmarks Runner & Results
**Command:** \`node scripts/run-benchmarks.mjs\`
**Runner:** $(permalink scripts/run-benchmarks.mjs)

**Head of \`benchmarks/results.json\`:**
\`\`\`json
${BM_HEAD}
\`\`\`

---

## 3) Network Guard Audit (no raw fetch/WebSocket in UI)
**Command:** \`git grep -nE 'fetch\\(|WebSocket|XMLHttpRequest|EventSource' extension/src\`
> Expectation: UI code must route through guard (e.g., \`guardedFetch\`)

\`\`\`txt
${NET_GREP}
\`\`\`

---

## 4) Key File Snippets (with permalinks)
${SNIP_MD}

---

## 5) Site (static) surfaces to align claims
Public site: https://virrpe.github.io/onbrd.run/

**Docs to verify:**
- Checks: $(permalink site/docs/checks.html)
- Scoring: $(permalink site/docs/scoring.html)
- Benchmarks (if present): $(permalink site/docs/benchmarks.html)
- Styling/FX: $(permalink site/styles.css), $(permalink site/styles/motion.css)

---

## 6) How to reproduce locally (optional)
\`\`\`bash
# determinism
node scripts/stability_test.mjs

# benchmarks
node scripts/run-benchmarks.mjs && head -60 benchmarks/results.json

# grep for unguarded calls
git grep -nE 'fetch\\(|WebSocket|XMLHttpRequest|EventSource' extension/src

# local site check (if needed)
(cd site && python3 -m http.server 8000 &) ; sleep 1 ; curl -s http://localhost:8000/ | sed -n '1,200p'
\`\`\`

---

**Notes:** No secrets are exposed; only code and non-sensitive outputs are included. If you need deeper slices, list file + lines and we'll append.
EOF

# 5) Commit & PR
git add docs/CLAUDE_EVIDENCE.md
git commit -m "docs: add CLAUDE_EVIDENCE.md with deterministic, local-first, AI-gate, benchmarks, metadata, site copy evidence"
gh pr create --fill --title "docs: Claude evidence bundle" --body "Aggregates permalinks + outputs for dialectical audit (determinism, local-only, AI gating, benchmarks, report metadata, site copy, polish)."