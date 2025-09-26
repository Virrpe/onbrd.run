#!/bin/bash
# Onbrd Reality Audit Script
# Reproducible audit of current vs narrative state

set -euo pipefail

AUDIT_DIR="/tmp/onbrd_audit_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$AUDIT_DIR"

echo "=== Onbrd Reality Audit ==="
echo "Audit directory: $AUDIT_DIR"
echo "Timestamp: $(date -Iseconds)"
echo

# 1. Repository state
echo "1. Capturing repository state..."
git rev-parse --abbrev-ref HEAD > "$AUDIT_DIR/branch.txt"
git status -s > "$AUDIT_DIR/status.txt"
git ls-files | sort > "$AUDIT_DIR/files.txt"
echo "✓ Repository state captured"

# 2. Extension analysis
echo "2. Analyzing Chrome extension..."
find extension -name "manifest.json" -exec cat {} \; > "$AUDIT_DIR/manifest.json"
grep -RIn "chrome\." extension/ > "$AUDIT_DIR/chrome-apis.txt" || true
grep -RInE "content_scripts|background|service_worker|action" extension/ > "$AUDIT_DIR/extension-structure.txt" || true
echo "✓ Extension structure analyzed"

# 3. Scoring and heuristics
echo "3. Examining scoring system..."
find packages -name "*.ts" -o -name "*.js" | xargs grep -l "score\|weight\|check\|rule\|heuristic" > "$AUDIT_DIR/core-scoring-files.txt" || true
cp packages/core/src/scoring.ts "$AUDIT_DIR/scoring.ts" 2>/dev/null || echo "scoring.ts not found"
cp packages/core/src/rules/defaults.ts "$AUDIT_DIR/rules-defaults.ts" 2>/dev/null || echo "rules-defaults.ts not found"
echo "✓ Scoring system examined"

# 4. AI usage check
echo "4. Checking for AI usage..."
grep -RInE "openai|anthropic|claude|gpt|deepseek|ollama|vertexai|bedrock|model\s*:|fetch\(.+\/api\/ai" . > "$AUDIT_DIR/ai-usage.txt" || true
echo "✓ AI usage checked"

# 5. API endpoints
echo "5. Identifying API endpoints..."
grep -RInE "express|fastify|hono|oak|next.*api|/api/" . > "$AUDIT_DIR/api-endpoints.txt" || true
echo "✓ API endpoints identified"

# 6. CI/CD check
echo "6. Checking CI/CD workflows..."
find .github -name "*.yml" -o -name "*.yaml" 2>/dev/null | xargs grep -l "actions\|workflows\|ci" > "$AUDIT_DIR/ci-workflows.txt" 2>/dev/null || echo "No CI workflows found" > "$AUDIT_DIR/ci-workflows.txt"
echo "✓ CI/CD workflows checked"

# 7. Privacy and network analysis
echo "7. Analyzing privacy and network usage..."
grep -RInE "fetch\(['\"]https?://" extension/ > "$AUDIT_DIR/network-exfiltration.txt" || echo "No network exfiltration found" > "$AUDIT_DIR/network-exfiltration.txt"
grep -RInE "WebSocket|sendBeacon|navigator\.sendBeacon" extension/ > "$AUDIT_DIR/network-websocket.txt" || echo "No WebSocket usage found" > "$AUDIT_DIR/network-websocket.txt"
echo "✓ Privacy analysis complete"

# 8. Determinism analysis
echo "8. Checking for determinism issues..."
grep -RInE "Math\.random|Date\.now|performance\.now|crypto\.getRandomValues" extension/ packages/ > "$AUDIT_DIR/randomness.txt" || true
grep -RInE "locale|viewport|userAgent|navigator\.language" extension/ packages/ > "$AUDIT_DIR/locale-deps.txt" || true
echo "✓ Determinism analysis complete"

# 9. Benchmarking check
echo "9. Checking for benchmarking..."
grep -RInE "benchmark|dataset|compare|percentile|cohort|baseline|reference" . > "$AUDIT_DIR/benchmarking.txt" || true
echo "✓ Benchmarking check complete"

# 10. Local site test
echo "10. Testing local site..."
python3 -m http.server 8000 -d site >"$AUDIT_DIR/http.log" 2>&1 & 
HTTP_PID=$!
sleep 2

# Test homepage content
for s in "How it works" "What teams like" "Core checks & scoring" "Additional check categories" "Custom checks & integrations" "Runs locally in your browser" "checksum" "Extension vs API"; do 
    curl -s "http://localhost:8000/" | grep -q "$s" && echo "✔ $s" || echo "✘ $s missing"
done > "$AUDIT_DIR/homepage-content.txt"

# Download key pages
curl -s "http://localhost:8000/docs/checks.html" > "$AUDIT_DIR/checks.html" 2>/dev/null || echo "Checks page not found" > "$AUDIT_DIR/checks.html"
curl -s "http://localhost:8000/docs/scoring.html" > "$AUDIT_DIR/scoring.html" 2>/dev/null || echo "Scoring page not found" > "$AUDIT_DIR/scoring.html"
curl -s "http://localhost:8000/changelog.html" > "$AUDIT_DIR/changelog.html" 2>/dev/null || echo "Changelog page not found" > "$AUDIT_DIR/changelog.html"

kill $HTTP_PID 2>/dev/null || true
echo "✓ Local site tested"

# 11. Generate summary
echo "11. Generating audit summary..."
cat > "$AUDIT_DIR/audit_summary.txt" << EOF
ONBRD REALITY AUDIT SUMMARY
Generated: $(date -Iseconds)
Branch: $(cat "$AUDIT_DIR/branch.txt")
Files analyzed: $(wc -l < "$AUDIT_DIR/files.txt")

KEY FINDINGS:
- Extension manifest: $(test -f "$AUDIT_DIR/manifest.json" && echo "FOUND" || echo "MISSING")
- Scoring system: $(test -f "$AUDIT_DIR/scoring.ts" && echo "FOUND" || echo "MISSING")
- AI usage: $(test -s "$AUDIT_DIR/ai-usage.txt" && echo "DETECTED" || echo "NOT DETECTED")
- API endpoints: $(test -s "$AUDIT_DIR/api-endpoints.txt" && echo "FOUND" || echo "NOT FOUND")
- CI/CD: $(grep -q "No CI workflows" "$AUDIT_DIR/ci-workflows.txt" && echo "NOT FOUND" || echo "FOUND")

For detailed analysis, see individual files in $AUDIT_DIR
EOF

echo
echo "=== Audit Complete ==="
echo "All artifacts saved to: $AUDIT_DIR"
echo "Summary: $AUDIT_DIR/audit_summary.txt"
echo
echo "To generate the final report, run:"
echo "  node scripts/generate-report.js $AUDIT_DIR"