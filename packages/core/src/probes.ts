import { Audit, Heuristics } from './types';
import { calculateScores, generateRecommendations } from './scoring';

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
    // Handle missing getBoundingClientRect method gracefully
    let rect;
    try {
      rect = cta.getBoundingClientRect();
    } catch (e) {
      // If getBoundingClientRect is not available, skip this element
      continue;
    }
    
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


function generateAuditId(): string {
  return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}