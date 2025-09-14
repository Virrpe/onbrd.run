import { Audit, Heuristics, Scores, Recommendation } from './types';

// Heuristic weights from docs/heuristics.md
const HEURISTIC_WEIGHTS = {
  h_cta_above_fold: 0.25,
  h_steps_count: 0.20,
  h_copy_clarity: 0.20,
  h_trust_markers: 0.20,
  h_perceived_signup_speed: 0.15
} as const;

// Heuristic fix texts from docs/heuristics.md
const HEURISTIC_FIXES = {
  h_cta_above_fold: "Move your primary CTA above the fold for immediate visibility",
  h_steps_count: "Reduce onboarding to 3 steps or fewer when possible",
  h_copy_clarity: "Use shorter sentences, active voice, and plain language",
  h_trust_markers: "Add testimonials, security badges, or customer logos",
  h_perceived_signup_speed: "Minimize required fields and show progress indicators"
} as const;

export function performAudit(): Audit {
  const heuristics = detectHeuristics();
  const scores = calculateScores(heuristics);
  const recommendations = generateRecommendations(heuristics);
  
  return {
    id: generateAuditId(),
    url: window.location.href,
    timestamp: new Date().toISOString(),
    heuristics,
    scores,
    recommendations
  };
}

function detectHeuristics(): Heuristics {
  return {
    h_cta_above_fold: detectCTA(),
    h_steps_count: countSteps(),
    h_copy_clarity: analyzeCopy(),
    h_trust_markers: findTrustMarkers(),
    h_perceived_signup_speed: estimateSignupSpeed()
  };
}

function detectCTA() {
  // H-CTA-ABOVE-FOLD: Detect primary call-to-action above fold (top 600px)
  const viewportHeight = 600; // Above fold threshold
  const ctas = document.querySelectorAll('button, a, input[type="submit"], [class*="cta"], [class*="action"]');
  
  let detected = false;
  let position = 0;
  let element = '';
  
  // Look for primary CTAs with action-oriented text
  const ctaKeywords = ['start', 'begin', 'sign up', 'signup', 'get started', 'join', 'create', 'continue', 'next'];
  
  for (const cta of ctas) {
    const rect = cta.getBoundingClientRect();
    const text = (cta.textContent || '').toLowerCase().trim();
    const hasCTAKeyword = ctaKeywords.some(keyword => text.includes(keyword));
    
    if (rect.top < viewportHeight && (hasCTAKeyword || cta.className.toLowerCase().includes('cta'))) {
      detected = true;
      position = Math.round(rect.top);
      element = cta.tagName.toLowerCase();
      if (cta.className) element += `.${cta.className.split(' ')[0]}`;
      break;
    }
  }
  
  return { detected, position, element };
}

function countSteps() {
  // H-STEPS-COUNT: Count distinct onboarding steps (forms, screens, modals)
  const forms = document.querySelectorAll('form').length;
  const screens = document.querySelectorAll('[class*="step"], [class*="screen"], [class*="onboarding"], [class*="wizard"]').length;
  const modals = document.querySelectorAll('[class*="modal"], [role="dialog"]').length;
  
  // Use the maximum of these indicators, but ensure at least 1
  const total = Math.max(forms, screens, modals, 1);
  
  return { total, forms, screens };
}

function analyzeCopy() {
  // H-COPY-CLARITY: Analyze text clarity (sentence length, passive voice, jargon)
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, div');
  let totalSentences = 0;
  let totalWords = 0;
  let passiveVoiceCount = 0;
  let jargonCount = 0;
  
  // Common jargon words in onboarding
  const jargonWords = ['utilize', 'leverage', 'synergy', 'paradigm', 'ecosystem', 'platform', 'solution', 'optimize', 'streamline', 'facilitate'];
  
  textElements.forEach(element => {
    const text = element.textContent || '';
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    totalSentences += sentences.length;
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/).length;
      totalWords += words;
      
      // Passive voice detection
      if (/\b(was|were|been|being|is|are|am)\s+\w+ed\b/i.test(sentence)) {
        passiveVoiceCount++;
      }
      
      // Jargon detection
      const sentenceLower = sentence.toLowerCase();
      jargonWords.forEach(jargon => {
        if (sentenceLower.includes(jargon)) {
          jargonCount++;
        }
      });
    });
  });
  
  const avgSentenceLength = totalSentences > 0 ? Math.round(totalWords / totalSentences) : 0;
  const passiveVoiceRatio = totalSentences > 0 ? Math.round((passiveVoiceCount / totalSentences) * 100) : 0;
  const jargonDensity = totalWords > 0 ? Math.round((jargonCount / totalWords) * 100) : 0;
  
  return {
    avg_sentence_length: avgSentenceLength,
    passive_voice_ratio: passiveVoiceRatio,
    jargon_density: jargonDensity
  };
}

function findTrustMarkers() {
  // H-TRUST-MARKERS: Find trust signals (testimonials, security badges, customer logos)
  const testimonials = document.querySelectorAll('[class*="testimonial"], [class*="review"], [class*="quote"], blockquote').length;
  const securityBadges = document.querySelectorAll('[class*="security"], [class*="trust"], [class*="badge"], [class*="certified"], [alt*="security"], [alt*="ssl"]').length;
  const customerLogos = document.querySelectorAll('[class*="logo"], [class*="customer"], [class*="client"], [alt*="logo"], img[src*="logo"]').length;
  
  return {
    testimonials,
    security_badges: securityBadges,
    customer_logos: customerLogos,
    total: testimonials + securityBadges + customerLogos
  };
}

function estimateSignupSpeed() {
  // H-PERCEIVED-SIGNUP-SPEED: Estimate completion time based on form complexity
  const formFields = document.querySelectorAll('input, select, textarea').length;
  const requiredFields = document.querySelectorAll('[required]').length;
  const progressIndicators = document.querySelectorAll('[class*="progress"], [class*="step-indicator"]').length;
  
  // Base estimate: 5 seconds per field, 10 seconds per required field, minus 20% for progress indicators
  let estimatedSeconds = Math.max(formFields * 5, requiredFields * 10, 30);
  if (progressIndicators > 0) {
    estimatedSeconds = Math.round(estimatedSeconds * 0.8); // Progress indicators reduce perceived time
  }
  
  return {
    form_fields: formFields,
    required_fields: requiredFields,
    estimated_seconds: estimatedSeconds
  };
}

function calculateScores(heuristics: Heuristics): Scores {
  // Calculate scores based on heuristics with proper scoring logic from docs/heuristics.md
  
  // H-CTA-ABOVE-FOLD: 100% if detected, 0% if not
  const ctaScore = heuristics.h_cta_above_fold.detected ? 100 : 0;
  
  // H-STEPS-COUNT: 1-3 steps = 100%, 4-5 = 80%, 6-7 = 60%, 8+ = 40%
  let stepsScore = 100;
  if (heuristics.h_steps_count.total >= 8) stepsScore = 40;
  else if (heuristics.h_steps_count.total >= 6) stepsScore = 60;
  else if (heuristics.h_steps_count.total >= 4) stepsScore = 80;
  
  // H-COPY-CLARITY: <15 words/sentence, <10% passive, <5% jargon = 100%
  let copyScore = 100;
  if (heuristics.h_copy_clarity.avg_sentence_length > 15) {
    copyScore -= Math.min(50, (heuristics.h_copy_clarity.avg_sentence_length - 15) * 2);
  }
  if (heuristics.h_copy_clarity.passive_voice_ratio > 10) {
    copyScore -= Math.min(30, (heuristics.h_copy_clarity.passive_voice_ratio - 10) * 3);
  }
  if (heuristics.h_copy_clarity.jargon_density > 5) {
    copyScore -= Math.min(20, (heuristics.h_copy_clarity.jargon_density - 5) * 4);
  }
  copyScore = Math.max(0, copyScore);
  
  // H-TRUST-MARKERS: 3+ trust elements = 100%, 2 = 80%, 1 = 60%, 0 = 40%
  let trustScore = 40;
  if (heuristics.h_trust_markers.total >= 3) trustScore = 100;
  else if (heuristics.h_trust_markers.total === 2) trustScore = 80;
  else if (heuristics.h_trust_markers.total === 1) trustScore = 60;
  
  // H-PERCEIVED-SIGNUP-SPEED: <30 seconds = 100%, 30-60s = 80%, 60-120s = 60%, 120s+ = 40%
  let speedScore = 40;
  if (heuristics.h_perceived_signup_speed.estimated_seconds < 30) speedScore = 100;
  else if (heuristics.h_perceived_signup_speed.estimated_seconds < 60) speedScore = 80;
  else if (heuristics.h_perceived_signup_speed.estimated_seconds < 120) speedScore = 60;
  
  // Calculate weighted overall score
  const overall = Math.round(
    ctaScore * HEURISTIC_WEIGHTS.h_cta_above_fold +
    stepsScore * HEURISTIC_WEIGHTS.h_steps_count +
    copyScore * HEURISTIC_WEIGHTS.h_copy_clarity +
    trustScore * HEURISTIC_WEIGHTS.h_trust_markers +
    speedScore * HEURISTIC_WEIGHTS.h_perceived_signup_speed
  );
  
  return {
    h_cta_above_fold: ctaScore,
    h_steps_count: stepsScore,
    h_copy_clarity: copyScore,
    h_trust_markers: trustScore,
    h_perceived_signup_speed: speedScore,
    overall
  };
}

function generateRecommendations(heuristics: Heuristics): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // H-CTA-ABOVE-FOLD recommendation
  if (!heuristics.h_cta_above_fold.detected) {
    recommendations.push({
      heuristic: "h_cta_above_fold",
      priority: "high",
      description: "No clear call-to-action found above the fold (top 600px)",
      fix: HEURISTIC_FIXES.h_cta_above_fold
    });
  }
  
  // H-STEPS-COUNT recommendation
  if (heuristics.h_steps_count.total > 3) {
    recommendations.push({
      heuristic: "h_steps_count",
      priority: "medium",
      description: `Onboarding flow has ${heuristics.h_steps_count.total} steps, which may cause friction`,
      fix: HEURISTIC_FIXES.h_steps_count
    });
  }
  
  // H-COPY-CLARITY recommendations
  if (heuristics.h_copy_clarity.avg_sentence_length > 15) {
    recommendations.push({
      heuristic: "h_copy_clarity",
      priority: "medium",
      description: `Average sentence length is ${heuristics.h_copy_clarity.avg_sentence_length} words, which may reduce comprehension`,
      fix: HEURISTIC_FIXES.h_copy_clarity
    });
  }
  
  if (heuristics.h_copy_clarity.passive_voice_ratio > 10) {
    recommendations.push({
      heuristic: "h_copy_clarity",
      priority: "low",
      description: `${heuristics.h_copy_clarity.passive_voice_ratio}% of sentences use passive voice, which can reduce clarity`,
      fix: "Use active voice to make sentences more direct and engaging"
    });
  }
  
  if (heuristics.h_copy_clarity.jargon_density > 5) {
    recommendations.push({
      heuristic: "h_copy_clarity",
      priority: "low",
      description: `${heuristics.h_copy_clarity.jargon_density}% of words are jargon, which may confuse users`,
      fix: "Replace technical terms with plain language"
    });
  }
  
  // H-TRUST-MARKERS recommendation
  if (heuristics.h_trust_markers.total < 3) {
    recommendations.push({
      heuristic: "h_trust_markers",
      priority: "medium",
      description: `Only ${heuristics.h_trust_markers.total} trust signals detected, which may reduce user confidence`,
      fix: HEURISTIC_FIXES.h_trust_markers
    });
  }
  
  // H-PERCEIVED-SIGNUP-SPEED recommendation
  if (heuristics.h_perceived_signup_speed.estimated_seconds > 60) {
    recommendations.push({
      heuristic: "h_perceived_signup_speed",
      priority: "high",
      description: `Signup process appears to take ${heuristics.h_perceived_signup_speed.estimated_seconds} seconds, which may cause abandonment`,
      fix: HEURISTIC_FIXES.h_perceived_signup_speed
    });
  }
  
  return recommendations;
}

function generateAuditId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}