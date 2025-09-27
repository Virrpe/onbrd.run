#!/usr/bin/env node
/**
 * Onbrd Reality Audit Report Generator
 * Analyzes audit artifacts and generates a comprehensive reality check report
 */

const fs = require('fs');
const path = require('path');

const AUDIT_DIR = process.argv[2] || '/tmp/onbrd_audit';
const REPORT_FILE = path.join(AUDIT_DIR, 'reality_audit_report.md');

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(AUDIT_DIR, filePath), 'utf8');
  } catch (e) {
    return null;
  }
}

function countLines(filePath) {
  const content = readFile(filePath);
  return content ? content.split('\n').length : 0;
}

function checkContains(filePath, pattern) {
  const content = readFile(filePath);
  return content ? content.includes(pattern) : false;
}

function analyzeScoringSystem() {
  const scoring = readFile('scoring.ts');
  const rules = readFile('rules-defaults.ts');
  
  if (!scoring || !rules) {
    return { status: 'MISSING', details: 'Core scoring files not found' };
  }
  
  const weights = scoring.match(/const HEURISTIC_WEIGHTS = \{([^}]+)\}/s);
  const rulesCount = (rules.match(/"id":/g) || []).length;
  
  return {
    status: 'FOUND',
    weights: weights ? weights[1].trim() : 'Not parsed',
    rulesCount,
    details: 'Scoring system implemented with weighted heuristics'
  };
}

function analyzeAIUsage() {
  const aiUsage = readFile('ai-usage.txt');
  if (!aiUsage || aiUsage.trim() === '') {
    return { status: 'NOT DETECTED', details: 'No AI usage found in codebase' };
  }
  
  const lines = aiUsage.split('\n').length;
  const hasOpenAI = aiUsage.includes('openai');
  const hasAnthropic = aiUsage.includes('anthropic');
  const hasClaude = aiUsage.includes('claude');
  const hasGPT = aiUsage.includes('gpt');
  
  return {
    status: 'DETECTED',
    lines,
    providers: {
      openai: hasOpenAI,
      anthropic: hasAnthropic,
      claude: hasClaude,
      gpt: hasGPT
    },
    details: `AI usage detected in ${lines} locations`
  };
}

function analyzeExtension() {
  const manifest = readFile('manifest.json');
  if (!manifest) {
    return { status: 'MISSING', details: 'Extension manifest not found' };
  }
  
  const chromeAPIs = readFile('chrome-apis.txt');
  const apiCount = chromeAPIs ? chromeAPIs.split('\n').length : 0;
  
  try {
    // Extract just the first JSON object (the actual manifest)
    const firstJsonMatch = manifest.match(/\{[\s\S]*?\}(?=\s*\{|$)/);
    if (!firstJsonMatch) {
      throw new Error('No valid JSON found in manifest');
    }
    
    const manifestData = JSON.parse(firstJsonMatch[0]);
    const permissions = manifestData.permissions || [];
    const hasActiveTab = permissions.includes('activeTab');
    const hasScripting = permissions.includes('scripting');
    const hasStorage = permissions.includes('storage');
    
    return {
      status: 'FOUND',
      version: manifestData.version,
      permissions: {
        activeTab: hasActiveTab,
        scripting: hasScripting,
        storage: hasStorage
      },
      chromeAPIs: apiCount,
      details: `Chrome extension v${manifestData.version} with ${apiCount} API usages`
    };
  } catch (e) {
    return {
      status: 'PARSE_ERROR',
      version: 'unknown',
      permissions: {},
      chromeAPIs: apiCount,
      details: `Failed to parse manifest: ${e.message}`
    };
  }
}

function analyzeDeterminism() {
  const randomness = readFile('randomness.txt');
  const locale = readFile('locale-deps.txt');
  
  const randomLines = randomness ? randomness.split('\n').length : 0;
  const localeLines = locale ? locale.split('\n').length : 0;
  
  const hasRandom = randomLines > 0;
  const hasLocale = localeLines > 0;
  
  return {
    status: hasRandom || hasLocale ? 'ISSUES DETECTED' : 'CLEAN',
    randomness: {
      detected: hasRandom,
      lines: randomLines
    },
    locale: {
      detected: hasLocale,
      lines: localeLines
    },
    details: hasRandom || hasLocale ? 'Non-deterministic elements found' : 'No determinism issues detected'
  };
}

function analyzePrivacy() {
  const networkExfil = readFile('network-exfiltration.txt');
  const websocket = readFile('network-websocket.txt');
  
  const hasExfil = networkExfil && !networkExfil.includes('No network exfiltration found');
  const hasWebsocket = websocket && !websocket.includes('No WebSocket usage found');
  
  return {
    status: hasExfil || hasWebsocket ? 'PRIVACY CONCERNS' : 'CLEAN',
    networkExfiltration: hasExfil,
    websocketUsage: hasWebsocket,
    details: hasExfil || hasWebsocket ? 'Network communication detected' : 'No network communication detected'
  };
}

function analyzeSiteContent() {
  const homepage = readFile('homepage-content.txt');
  const checks = readFile('checks.html');
  const scoring = readFile('scoring.html');
  
  if (!homepage) {
    return { status: 'MISSING', details: 'Homepage content analysis not available' };
  }
  
  const hasHowItWorks = homepage.includes('✔ How it works');
  const hasScoring = homepage.includes('✔ Core checks & scoring');
  const hasLocal = homepage.includes('✔ Runs locally in your browser');
  const hasChecksPage = checks && !checks.includes('Checks page not found');
  const hasScoringPage = scoring && !scoring.includes('Scoring page not found');
  
  return {
    status: 'ANALYZED',
    content: {
      howItWorks: hasHowItWorks,
      scoring: hasScoring,
      localProcessing: hasLocal,
      checksPage: hasChecksPage,
      scoringPage: hasScoringPage
    },
    details: `Homepage analyzed, documentation pages: ${hasChecksPage ? 'found' : 'missing'}`
  };
}

function generateReport() {
  const branch = readFile('branch.txt') || 'unknown';
  const timestamp = new Date().toISOString();
  
  const scoring = analyzeScoringSystem();
  const ai = analyzeAIUsage();
  const extension = analyzeExtension();
  const determinism = analyzeDeterminism();
  const privacy = analyzePrivacy();
  const site = analyzeSiteContent();
  
  const report = `# Onbrd Reality Audit Report

Generated: ${timestamp}
Branch: ${branch}
Audit Directory: ${AUDIT_DIR}

## Executive Summary

This reality audit compares the current implementation state of Onbrd against its documented claims and marketing narrative.

### Key Findings

| Component | Status | Assessment |
|-----------|--------|------------|
| Chrome Extension | ${extension.status} | ${extension.details} |
| Scoring System | ${scoring.status} | ${scoring.details} |
| AI Usage | ${ai.status} | ${ai.details} |
| Determinism | ${determinism.status} | ${determinism.details} |
| Privacy | ${privacy.status} | ${privacy.details} |
| Site Content | ${site.status} | ${site.details} |

## Detailed Analysis

### 1. Chrome Extension Analysis

**Status**: ${extension.status}
- Version: ${extension.version || 'N/A'}
- Chrome API usages: ${extension.chromeAPIs || 0}
- Permissions: ${JSON.stringify(extension.permissions || {}, null, 2)}

**Assessment**: ${extension.details}

### 2. Scoring System Analysis

**Status**: ${scoring.status}
- Rules count: ${scoring.rulesCount || 'N/A'}
- Weights configuration: ${scoring.weights ? 'Present' : 'Missing'}

**Assessment**: ${scoring.details}

### 3. AI Usage Analysis

**Status**: ${ai.status}
- Lines of AI-related code: ${ai.lines || 0}
- AI Providers detected: ${ai.providers ? Object.keys(ai.providers).filter(p => ai.providers[p]).join(', ') : 'None'}

**Assessment**: ${ai.details}

### 4. Determinism Analysis

**Status**: ${determinism.status}
- Randomness issues: ${determinism.randomness.detected ? 'DETECTED' : 'None'} (${determinism.randomness.lines} lines)
- Locale dependencies: ${determinism.locale.detected ? 'DETECTED' : 'None'} (${determinism.locale.lines} lines)

**Assessment**: ${determinism.details}

### 5. Privacy Analysis

**Status**: ${privacy.status}
- Network exfiltration: ${privacy.networkExfiltration ? 'DETECTED' : 'None'}
- WebSocket usage: ${privacy.websocketUsage ? 'DETECTED' : 'None'}

**Assessment**: ${privacy.details}

### 6. Site Content Analysis

**Status**: ${site.status}
- Homepage claims verified: ${Object.values(site.content || {}).filter(v => v).length}/${Object.keys(site.content || {}).length}

**Content Verification**:
${Object.entries(site.content || {}).map(([key, value]) => `- ${key}: ${value ? '✓' : '✗'}`).join('\n')}

**Assessment**: ${site.details}

## Reality Check Summary

### Claims vs Reality

1. **"Runs locally in your browser"**
   - Status: ${site.content?.localProcessing ? '✓ VERIFIED' : '✗ NOT VERIFIED'}
   - Analysis: ${privacy.status === 'CLEAN' ? 'No network communication detected - appears to run locally' : 'Network communication detected - may not be fully local'}

2. **"No AI required"**
   - Status: ${ai.status === 'NOT DETECTED' ? '✓ VERIFIED' : '✗ CONTRADICTED'}
   - Analysis: ${ai.details}

3. **"Deterministic scoring"**
   - Status: ${determinism.status === 'CLEAN' ? '✓ VERIFIED' : '✗ ISSUES DETECTED'}
   - Analysis: ${determinism.details}

4. **"Privacy-first"**
   - Status: ${privacy.status === 'CLEAN' ? '✓ VERIFIED' : '✗ CONCERNS'}
   - Analysis: ${privacy.details}

### Recommendations

${determinism.status !== 'CLEAN' ? '1. **Fix determinism issues**: Remove randomness and locale dependencies to ensure reproducible audits' : ''}
${privacy.status !== 'CLEAN' ? '2. **Address privacy concerns**: Eliminate network communication if claiming local-only operation' : ''}
${ai.status !== 'NOT DETECTED' ? '3. **Clarify AI usage**: Update documentation if AI is actually used in the system' : ''}
${scoring.status === 'MISSING' ? '4. **Implement scoring system**: Core scoring functionality appears to be missing or incomplete' : ''}

## Technical Details

- Total files analyzed: ${countLines('files.txt')}
- Chrome extension API calls: ${extension.chromeAPIs || 0}
- Scoring rules implemented: ${scoring.rulesCount || 0}
- Lines of AI-related code: ${ai.lines || 0}

---

*This audit was generated automatically by the Onbrd Reality Audit system. For questions or to reproduce this audit, run the audit script and provide the audit directory path.*
`;
  
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`✓ Reality audit report generated: ${REPORT_FILE}`);
  
  // Also create a JSON summary for programmatic use
  const summary = {
    timestamp,
    branch: branch.trim(),
    findings: {
      extension,
      scoring,
      ai,
      determinism,
      privacy,
      site
    },
    realityCheck: {
      localProcessing: site.content?.localProcessing && privacy.status === 'CLEAN',
      noAI: ai.status === 'NOT DETECTED',
      deterministic: determinism.status === 'CLEAN',
      privacyFirst: privacy.status === 'CLEAN'
    }
  };
  
  fs.writeFileSync(path.join(AUDIT_DIR, 'audit_summary.json'), JSON.stringify(summary, null, 2));
  console.log(`✓ JSON summary generated: ${path.join(AUDIT_DIR, 'audit_summary.json')}`);
}

// Run the report generation
generateReport();