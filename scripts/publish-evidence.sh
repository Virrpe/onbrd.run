#!/bin/bash
set -euo pipefail

PR_NUMBER=32
BRANCH="chore/claude-evidence-bundle"

# 0) Ensure branch exists & file is present
git fetch origin --prune
git switch "$BRANCH" || git switch -c "$BRANCH"

if [[ ! -f docs/CLAUDE_EVIDENCE.md ]]; then
  echo "ERROR: docs/CLAUDE_EVIDENCE.md not found in $BRANCH"
  echo "If the evidence script created it elsewhere, regenerate it now."
  exit 1
fi

# 1) Make sure file is committed and pushed
if ! git diff --quiet -- docs/CLAUDE_EVIDENCE.md || ! git diff --cached --quiet -- docs/CLAUDE_EVIDENCE.md; then
  git add docs/CLAUDE_EVIDENCE.md
  git commit -m "docs: ensure CLAUDE_EVIDENCE.md is present in evidence bundle branch"
  git push -u origin "$BRANCH"
fi

# 2) Construct raw URL (branch permalink)
OWNER_REPO=$(git remote -v | awk '/origin.*(https|git@)/{print $2}' | head -1 | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
RAW_URL="https://raw.githubusercontent.com/${OWNER_REPO}/${BRANCH}/docs/CLAUDE_EVIDENCE.md"

# 3) Sanity check raw URL is fetchable (GitHub may need a second after push)
for i in {1..5}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$RAW_URL" || true)
  if [[ "$STATUS" == "200" ]]; then break; fi
  sleep 2
done

# 4) If raw URL still not 200, publish a public Gist as a fallback
GIST_URL=""
if [[ "${STATUS:-}" != "200" ]]; then
  GIST_URL=$(gh gist create docs/CLAUDE_EVIDENCE.md --public -d "Onbrd evidence bundle for Claude" | tail -n1)
fi

# 5) Post the full content inline on the PR (so Claude can read it immediately)
#    If the file is very large, fallback to posting a concise header + link.
FILE_SIZE=$(wc -c < docs/CLAUDE_EVIDENCE.md)
if (( FILE_SIZE < 60000 )); then
  gh pr comment "$PR_NUMBER" --body-file docs/CLAUDE_EVIDENCE.md
else
  {
    echo "**Evidence bundle is large; see the raw link below.**"
    echo ""
    echo "**Raw link:** ${RAW_URL}"
    if [[ -n "$GIST_URL" ]]; then
      echo "**Gist fallback:** ${GIST_URL}"
    fi
  } > /tmp/claude-evidence-comment.md
  gh pr comment "$PR_NUMBER" --body-file /tmp/claude-evidence-comment.md
fi

# 6) Add a short pointer comment with both links and reproduction commands
{
  echo "Hi Claude — here are stable links to the evidence bundle:"
  echo ""
  echo "- Raw (branch) URL: ${RAW_URL}"
  if [[ -n "$GIST_URL" ]]; then
    echo "- Public Gist fallback: ${GIST_URL}"
  fi
  echo ""
  echo "Reproduction commands:"
  echo '```bash'
  echo 'node scripts/stability_test.mjs'
  echo 'node scripts/run-benchmarks.mjs && head -60 benchmarks/results.json'
  echo "git grep -nE 'fetch\\(|WebSocket|XMLHttpRequest|EventSource' extension/src"
  echo '(cd site && python3 -m http.server 8000 &) ; sleep 1 ; curl -s http://localhost:8000/ | sed -n "1,200p"'
  echo '```'
} > /tmp/claude-evidence-links.md
gh pr comment "$PR_NUMBER" --body-file /tmp/claude-evidence-links.md

echo "Done. Posted evidence content and links on PR #$PR_NUMBER."
echo "Raw URL (should be public): $RAW_URL"
[[ -n "$GIST_URL" ]] && echo "Gist fallback: $GIST_URL"