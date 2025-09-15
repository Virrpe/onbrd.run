export const revalidate = 3600; // cache on edge proxies

// add manifest integrity check on boot (unique IDs, weights sum ≈ 1)
function validateManifest(manifest: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for unique rule IDs
  const ruleIds = new Set<string>();
  for (const rule of manifest.rules) {
    if (ruleIds.has(rule.id)) {
      errors.push(`Duplicate rule ID: ${rule.id}`);
    }
    ruleIds.add(rule.id);
  }
  
  // Check weights sum to approximately 1 (allowing small rounding errors)
  const totalWeight = manifest.rules.reduce((sum: number, rule: any) => sum + rule.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    errors.push(`Weights sum to ${totalWeight}, expected ~1.0`);
  }
  
  // Check required fields
  for (const rule of manifest.rules) {
    if (!rule.id || !rule.category || !rule.weight || !rule.description || !rule.fix) {
      errors.push(`Rule missing required fields: ${JSON.stringify(rule)}`);
    }
    if (typeof rule.weight !== 'number' || rule.weight <= 0) {
      errors.push(`Invalid weight for rule ${rule.id}: ${rule.weight}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

const manifest = {
  "version":"1.1.0",
  "updatedAt":"2025-09-15T18:30:00Z",
  "categories":["Foundation","Attention","Clarity","Trust","Action","Retention"],
  "rules":[
    {"id":"F-PERFORMANCE-LCP","category":"Foundation","weight":0.0727,"description":"Largest Contentful Paint should occur within ~2.5s.","fix":"Optimize hero media, lazy-load non-critical JS, compress images.","confidence":"medium"},
    {"id":"F-ACCESSIBILITY-FOCUS","category":"Foundation","weight":0.0545,"description":"Interactive elements are keyboard accessible with visible focus.","fix":"Restore focus outlines; ensure Tab reaches all CTAs/inputs.","confidence":"high"},
    {"id":"F-MOBILE-RESPONSIVE","category":"Foundation","weight":0.0455,"description":"Critical onboarding elements usable on mobile.","fix":"Add viewport meta; ensure hero CTA & form are usable <400px.","confidence":"high"},
    {"id":"A-CTA-ABOVE-FOLD","category":"Attention","weight":0.0909,"description":"Primary CTA visible without scrolling (desktop & mobile).","fix":"Place primary signup CTA within initial viewport.","confidence":"high"},
    {"id":"A-HEADLINE-VALUE-PROP","category":"Attention","weight":0.0727,"description":"Hero headline states value proposition clearly.","fix":"Lead with outcome-based headline, not features.","confidence":"medium"},
    {"id":"A-VISUAL-HIERARCHY","category":"Attention","weight":0.0545,"description":"CTA has strongest visual weight in hero.","fix":"Increase size/contrast; directional cues to CTA.","confidence":"medium"},
    {"id":"C-COGNITIVE-LOAD","category":"Clarity","weight":0.0636,"description":"Hero presents ≤5 distinct chunks (headline, subhead, 3 bullets).","fix":"Consolidate; use progressive disclosure.","confidence":"medium"},
    {"id":"C-READABILITY-SCORE","category":"Clarity","weight":0.0455,"description":"Primary copy ≤ grade 8 reading level.","fix":"Shorten sentences; simpler vocabulary.","confidence":"low"},
    {"id":"C-BENEFIT-CLARITY","category":"Clarity","weight":0.0455,"description":"Benefits are specific, outcome-focused.","fix":"Replace feature lists with concrete outcomes/time saved.","confidence":"medium"},
    {"id":"T-SOCIAL-PROOF","category":"Trust","weight":0.0818,"description":"Credible social proof within signup viewport.","fix":"Add testimonials/logos/usage stats near CTA.","confidence":"high"},
    {"id":"T-PRICING-TRANSPARENCY","category":"Trust","weight":0.0545,"description":"Pricing discoverable pre-signup.","fix":"Visible Pricing link in nav or near signup.","confidence":"high"},
    {"id":"T-SECURITY-ASSURANCE","category":"Trust","weight":0.0364,"description":"Security/privacy reassurance near sensitive fields.","fix":"Add SSL/privacy text, policy links, or lock icon.","confidence":"low"},
    {"id":"AC-SIGNUP-FRICTION","category":"Action","weight":0.0727,"description":"Initial account creation ≤3 fields.","fix":"Defer optional fields post-signup.","confidence":"high"},
    {"id":"AC-PROGRESS-VISIBILITY","category":"Action","weight":0.0455,"description":"Multi-step flows show clear progress.","fix":"Add progress bar or 'Step X of Y'.","confidence":"high"},
    {"id":"AC-ERROR-PREVENTION","category":"Action","weight":0.0364,"description":"Forms prevent common input errors.","fix":"Inline validation, input masks, helpful placeholders.","confidence":"medium"},
    {"id":"R-TIME-TO-VALUE","category":"Retention","weight":0.0727,"description":"First core value reached in first session.","fix":"Quick-start, demo data, guided first task.","confidence":"medium"},
    {"id":"R-EMPTY-STATE-DESIGN","category":"Retention","weight":0.0273,"description":"Avoid blank first-use screens.","fix":"Seed with sample content/next steps.","confidence":"low"},
    {"id":"R-COMPLETION-FEEDBACK","category":"Retention","weight":0.0273,"description":"Positive reinforcement after first actions.","fix":"Success animation or confirmation with next action.","confidence":"medium"}
  ]
};

// Validate manifest on boot
const validation = validateManifest(manifest);
if (!validation.valid) {
  console.error('Manifest validation failed:', validation.errors);
  // In production, you might want to throw an error or use a fallback
}

export async function GET() {
  return new Response(JSON.stringify(manifest), {
    headers: { 'content-type': 'application/json', 'cache-control':'public, max-age=0, s-maxage=3600' }
  });
}