import { Audit } from '@core/types';

export function renderReport(audit: Audit): string {
  const { url, timestamp, scores, heuristics, recommendations } = audit;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Audit Report - ${url}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .header {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .score-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .score {
      font-size: 2em;
      font-weight: bold;
      color: #28a745;
    }
    .score-bad {
      color: #dc3545;
    }
    .score-medium {
      color: #ffc107;
    }
    .recommendation {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .priority-high {
      border-left: 4px solid #dc3545;
    }
    .priority-medium {
      border-left: 4px solid #ffc107;
    }
    .priority-low {
      border-left: 4px solid #28a745;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .copy-to-ticket {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .copy-button {
      background: #2196f3;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .copy-button:hover {
      background: #1976d2;
    }
    .ticket-content {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
      font-family: monospace;
      font-size: 14px;
      white-space: pre-wrap;
    }
    .heuristic-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Onboarding Audit Report</h1>
    <p><strong>URL:</strong> ${url}</p>
    <p><strong>Audit Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
    <p><strong>Overall Score:</strong> <span class="score ${scores.overall >= 80 ? '' : scores.overall >= 60 ? 'score-medium' : 'score-bad'}">${scores.overall}/100</span></p>
  </div>

  <h2>Heuristic Analysis</h2>
  <table>
    <thead>
      <tr>
        <th>Heuristic</th>
        <th>Score</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          CTA Above Fold
          <div class="heuristic-id">H-CTA-ABOVE-FOLD</div>
        </td>
        <td>${scores.h_cta_above_fold}/100</td>
        <td>${heuristics.h_cta_above_fold.detected ? 'Primary CTA detected above fold' : 'No CTA found above 600px'}</td>
      </tr>
      <tr>
        <td>
          Steps Count
          <div class="heuristic-id">H-STEPS-COUNT</div>
        </td>
        <td>${scores.h_steps_count}/100</td>
        <td>${heuristics.h_steps_count.total} total steps (${heuristics.h_steps_count.forms} forms, ${heuristics.h_steps_count.screens} screens)</td>
      </tr>
      <tr>
        <td>
          Copy Clarity
          <div class="heuristic-id">H-COPY-CLARITY</div>
        </td>
        <td>${scores.h_copy_clarity}/100</td>
        <td>Avg sentence: ${heuristics.h_copy_clarity.avg_sentence_length} words, ${heuristics.h_copy_clarity.passive_voice_ratio}% passive voice, ${heuristics.h_copy_clarity.jargon_density}% jargon</td>
      </tr>
      <tr>
        <td>
          Trust Markers
          <div class="heuristic-id">H-TRUST-MARKERS</div>
        </td>
        <td>${scores.h_trust_markers}/100</td>
        <td>${heuristics.h_trust_markers.total} trust signals (${heuristics.h_trust_markers.testimonials} testimonials, ${heuristics.h_trust_markers.security_badges} security badges, ${heuristics.h_trust_markers.customer_logos} logos)</td>
      </tr>
      <tr>
        <td>
          Signup Speed
          <div class="heuristic-id">H-PERCEIVED-SIGNUP-SPEED</div>
        </td>
        <td>${scores.h_perceived_signup_speed}/100</td>
        <td>~${heuristics.h_perceived_signup_speed.estimated_seconds}s completion (${heuristics.h_perceived_signup_speed.form_fields} fields, ${heuristics.h_perceived_signup_speed.required_fields} required)</td>
      </tr>
    </tbody>
  </table>

  <h2>Recommendations</h2>
  ${recommendations.map(rec => `
    <div class="recommendation priority-${rec.priority}">
      <h4>${rec.heuristic} (${rec.priority} priority)</h4>
      <p><strong>Issue:</strong> ${rec.description}</p>
      <p><strong>Fix:</strong> ${rec.fix}</p>
    </div>
  `).join('')}

  <div class="copy-to-ticket">
    <h3>Copy to Ticket</h3>
    <p>Click the button below to copy a formatted summary for your project management tool:</p>
    <button class="copy-button" onclick="copyTicketContent()">Copy Ticket Content</button>
    <div class="ticket-content" id="ticketContent">
## Onboarding Audit Results

**URL:** ${url}
**Overall Score:** ${scores.overall}/100
**Audit Date:** ${new Date(timestamp).toLocaleString()}

### Issues Found:
${recommendations.map(rec => `- **${rec.heuristic}** (${rec.priority} priority): ${rec.description}`).join('\n')}

### Recommended Fixes:
${recommendations.map(rec => `- **${rec.heuristic}**: ${rec.fix}`).join('\n')}

### Next Steps:
1. Address high priority issues first
2. Test changes with users
3. Re-run audit to verify improvements
    </div>
  </div>

  <footer style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: small;">
    Generated by OnboardingAudit.ai — ${new Date().toISOString().slice(0,16).replace('T',' ')} — ${new URL(audit.url).hostname}
  </footer>

  <script>
    function copyTicketContent() {
      const content = document.getElementById('ticketContent').textContent;
      navigator.clipboard.writeText(content).then(() => {
        const button = document.querySelector('.copy-button');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
      });
    }
  </script>
</body>
</html>`;
}

export function generateHTMLReport(audit: Audit): string {
  return renderReport(audit);
}

export function generateJSONReport(audit: Audit): string {
  return JSON.stringify(audit, null, 2);
}

export function generateMarkdownReport(audit: Audit): string {
  const { url, timestamp, scores, heuristics, recommendations } = audit;
  
  return `# Onboarding Audit Report

**URL:** ${url}
**Audit Date:** ${new Date(timestamp).toLocaleString()}
**Overall Score:** ${scores.overall}/100

## Heuristic Analysis

| Heuristic | Score | Details |
|-----------|-------|---------|
| CTA Above Fold | ${scores.h_cta_above_fold}/100 | ${heuristics.h_cta_above_fold.detected ? 'CTA detected' : 'No CTA found'} |
| Steps Count | ${scores.h_steps_count}/100 | ${heuristics.h_steps_count.total} total steps |
| Copy Clarity | ${scores.h_copy_clarity}/100 | Avg sentence: ${heuristics.h_copy_clarity.avg_sentence_length} words |
| Trust Markers | ${scores.h_trust_markers}/100 | ${heuristics.h_trust_markers.total} trust signals |
| Signup Speed | ${scores.h_perceived_signup_speed}/100 | ~${heuristics.h_perceived_signup_speed.estimated_seconds}s completion |

## Recommendations

${recommendations.map(rec => `
### ${rec.heuristic} (${rec.priority} priority)

**Issue:** ${rec.description}
**Fix:** ${rec.fix}
`).join('\n')}

---

*Generated by OnboardingAudit.ai*
`.trim();
}