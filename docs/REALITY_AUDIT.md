# Onbrd Reality Audit Report

Generated: 2025-09-25T17:45:49.438Z
Branch: chore/reality-audit

Audit Directory: /tmp/onbrd_audit_20250925_192022

## Executive Summary

This reality audit compares the current implementation state of Onbrd against its documented claims and marketing narrative.

### Key Findings

| Component | Status | Assessment |
|-----------|--------|------------|
| Chrome Extension | FOUND | Chrome extension v0.1.7 with 65 API usages |
| Scoring System | FOUND | Scoring system implemented with weighted heuristics |
| AI Usage | DETECTED | AI usage detected in 390 locations |
| Determinism | ISSUES DETECTED | Non-deterministic elements found |
| Privacy | PRIVACY CONCERNS | Network communication detected |
| Site Content | ANALYZED | Homepage analyzed, documentation pages: found |

## Detailed Analysis

### 1. Chrome Extension Analysis

**Status**: FOUND
- Version: 0.1.7
- Chrome API usages: 65
- Permissions: {
  "activeTab": true,
  "scripting": true,
  "storage": true
}

**Assessment**: Chrome extension v0.1.7 with 65 API usages

### 2. Scoring System Analysis

**Status**: FOUND
- Rules count: 18
- Weights configuration: Present

**Assessment**: Scoring system implemented with weighted heuristics

### 3. AI Usage Analysis

**Status**: DETECTED
- Lines of AI-related code: 390
- AI Providers detected: openai, anthropic, claude, gpt

**Assessment**: AI usage detected in 390 locations

### 4. Determinism Analysis

**Status**: ISSUES DETECTED
- Randomness issues: DETECTED (108 lines)
- Locale dependencies: DETECTED (394 lines)

**Assessment**: Non-deterministic elements found

### 5. Privacy Analysis

**Status**: PRIVACY CONCERNS
- Network exfiltration: None
- WebSocket usage: DETECTED

**Assessment**: Network communication detected

### 6. Site Content Analysis

**Status**: ANALYZED
- Homepage claims verified: 5/5

**Content Verification**:
- howItWorks: ✓
- scoring: ✓
- localProcessing: ✓
- checksPage: ✓
- scoringPage: ✓

**Assessment**: Homepage analyzed, documentation pages: found

## Reality Check Summary

### Claims vs Reality

1. **"Runs locally in your browser"**
   - Status: ✓ VERIFIED
   - Analysis: Network communication detected - may not be fully local

2. **"No AI required"**
   - Status: ✗ CONTRADICTED
   - Analysis: AI usage detected in 390 locations

3. **"Deterministic scoring"**
   - Status: ✗ ISSUES DETECTED
   - Analysis: Non-deterministic elements found

4. **"Privacy-first"**
   - Status: ✗ CONCERNS
   - Analysis: Network communication detected

### Recommendations

1. **Fix determinism issues**: Remove randomness and locale dependencies to ensure reproducible audits
2. **Address privacy concerns**: Eliminate network communication if claiming local-only operation
3. **Clarify AI usage**: Update documentation if AI is actually used in the system


## Technical Details

- Total files analyzed: 1191
- Chrome extension API calls: 65
- Scoring rules implemented: 18
- Lines of AI-related code: 390

---

*This audit was generated automatically by the Onbrd Reality Audit system. For questions or to reproduce this audit, run the audit script and provide the audit directory path.*
