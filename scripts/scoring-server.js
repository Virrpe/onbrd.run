/**
 * Simple HTML analysis for benchmark scoring
 * This is a JavaScript version for direct import in Node.js
 */

// Heuristic weights from docs/heuristics.md
const HEURISTIC_WEIGHTS = {
  h_cta_above_fold: 0.25,
  h_steps_count: 0.20,
  h_copy_clarity: 0.20,
  h_trust_markers: 0.20,
  h_perceived_signup_speed: 0.15
};

/**
 * Simple HTML analysis function
 * Analyzes HTML content and returns heuristics
 */
function analyzeHTML(html) {
  if (!html || typeof html !== 'string') {
    return {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 1, forms: 0, screens: 0 },
      h_copy_clarity: { avg_sentence_length: 10, passive_voice_ratio: 5, jargon_density: 2 },
      h_trust_markers: { testimonials: 0, security_badges: 0, customer_logos: 0, total: 0 },
      h_perceived_signup_speed: { form_fields: 3, required_fields: 2, estimated_seconds: 45 }
    };
  }

  // Improved CTA detection with viewport-independent fold and better element filtering
  const ctaKeywords = ['start', 'begin', 'sign up', 'signup', 'get started', 'join', 'create', 'continue', 'next', 'try', 'get started'];
  const actionVerbs = ['start', 'continue', 'sign up', 'try', 'get started'];
  
  // Check for visible CTA elements above the fold (min(600px, 80vh))
  let ctaDetected = false;
  
  // Look for button and link elements with action verbs
  const ctaRegex = new RegExp(`<(?:button|a|input)[^>]*>([^<]*(?:${ctaKeywords.join('|')})[^<]*)</(?:button|a)>`, 'gi');
  const ctaMatches = [...html.matchAll(ctaRegex)];
  
  for (const match of ctaMatches) {
    const fullMatch = match[0];
    const elementHtml = fullMatch.toLowerCase();
    
    // Skip hidden elements
    if (elementHtml.includes('opacity:0') ||
        elementHtml.includes('visibility:hidden') ||
        elementHtml.includes('aria-hidden="true"') ||
        elementHtml.includes('display:none')) {
      continue;
    }
    
    // Check if it's a button or has role=button
    const isButton = elementHtml.includes('<button') ||
                    elementHtml.includes('role="button"') ||
                    elementHtml.includes("role='button'");
    
    // Prefer buttons with action verbs
    const hasActionVerb = actionVerbs.some(verb =>
      elementHtml.includes(verb) || elementHtml.includes(verb.replace(' ', ''))
    );
    
    if (isButton && hasActionVerb) {
      ctaDetected = true;
      break;
    }
  }
  
  // If no button CTAs found, check for link CTAs
  if (!ctaDetected) {
    for (const match of ctaMatches) {
      const fullMatch = match[0];
      const elementHtml = fullMatch.toLowerCase();
      
      // Skip hidden elements
      if (elementHtml.includes('opacity:0') ||
          elementHtml.includes('visibility:hidden') ||
          elementHtml.includes('aria-hidden="true"') ||
          elementHtml.includes('display:none')) {
        continue;
      }
      
      ctaDetected = true;
      break;
    }
  }
  
  // Enhanced step count detection
  const stepKeywords = ['step', 'stage', 'phase', 'progress', 'continue', 'next'];
  const wizardIndicators = [
    /<ol[^>]*>/gi, // ordered lists
    /<ul[^>]*class="[^"]*progress[^"]*"/gi, // progress indicators
    /<div[^>]*class="[^"]*breadcrumb[^"]*"/gi, // breadcrumbs
    /<div[^>]*class="[^"]*wizard[^"]*"/gi, // wizard classes
    /<div[^>]*class="[^"]*step[^"]*"/gi // step classes
  ];
  
  let stepCount = 0;
  let hasWizard = false;
  
  // Count wizard indicators
  wizardIndicators.forEach(indicator => {
    const matches = html.match(indicator) || [];
    stepCount += matches.length;
    if (matches.length > 0) hasWizard = true;
  });
  
  // Count explicit step mentions
  const stepRegex = new RegExp(`<[^>]*>([^<]*(?:${stepKeywords.join('|')})[^<]*)</[^>]*>`, 'gi');
  const stepMatches = html.match(stepRegex) || [];
  stepCount += Math.min(stepMatches.length, 3);
  
  // Count forms
  const formMatches = html.match(/<form[^>]*>/gi) || [];
  const forms = formMatches.length;
  
  // Count modals
  const modalMatches = html.match(/class="[^"]*(?:modal|dialog)[^"]*"/gi) || [];
  const modals = modalMatches.length;
  
  // Cap penalty for quick setups
  const totalSteps = Math.max(stepCount, forms, modals, 1);
  const stepsCountGood = totalSteps <= 3 || (hasWizard && totalSteps <= 5);
  
  // Enhanced copy clarity check
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const charCount = textContent.length;
  const wordCount = textContent.split(' ').length;
  
  // Check for walls of text above fold (>160 chars without structure)
  const hasHeadings = /<h[1-6][^>]*>/gi.test(html);
  const hasBullets = /<ul[^>]*>/gi.test(html) || /<ol[^>]*>/gi.test(html);
  const hasWallOfText = charCount > 160 && !hasHeadings && !hasBullets;
  
  // Check for benefit-led H1
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  const hasBenefitH1 = h1Match && h1Match[1] &&
    (h1Match[1].toLowerCase().includes('get') ||
     h1Match[1].toLowerCase().includes('start') ||
     h1Match[1].toLowerCase().includes('join') ||
     h1Match[1].toLowerCase().includes('try'));
  
  // Simple copy analysis for additional metrics
  const textMatches = html.match(/>([^<]+)</g) || [];
  let totalWords = 0;
  let totalSentences = 0;
  let passiveVoiceCount = 0;
  let jargonCount = 0;
  
  const jargonWords = ['utilize', 'leverage', 'synergy', 'paradigm', 'ecosystem', 'platform', 'solution', 'optimize', 'streamline', 'facilitate'];
  
  textMatches.forEach(match => {
    const text = match.replace(/[<>]/g, '').trim();
    if (text.length > 0) {
      const words = text.split(/\s+/).length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      
      totalWords += words;
      totalSentences += Math.max(sentences, 1);
      
      // Simple passive voice detection
      if (/\b(was|were|been|being|is|are|am)\s+\w+ed\b/i.test(text)) {
        passiveVoiceCount++;
      }
      
      // Simple jargon detection
      const textLower = text.toLowerCase();
      jargonWords.forEach(jargon => {
        if (textLower.includes(jargon)) {
          jargonCount++;
        }
      });
    }
  });
  
  const avgSentenceLength = totalSentences > 0 ? Math.round(totalWords / totalSentences) : 10;
  const passiveVoiceRatio = totalSentences > 0 ? Math.round((passiveVoiceCount / totalSentences) * 100) : 5;
  const jargonDensity = totalWords > 0 ? Math.round((jargonCount / totalWords) * 100) : 2;
  
  const copyClarityGood = !hasWallOfText && (wordCount <= 150 || hasBenefitH1);
  
  // Enhanced trust markers detection
  const trustElements = [
    'lock', 'secure', 'safe', 'trusted', 'verified', 'encrypted', 'privacy', 'protected',
    'ssl', 'https', 'shield', 'badge', 'certified', 'guarantee', 'money-back', 'refund',
    'soc', 'iso', 'compliance', 'gdpr', 'pci', 'hipaa'
  ];
  
  const trustSelectors = [
    /<[^>]*class="[^"]*lock[^"]*"/gi,
    /<[^>]*class="[^"]*shield[^"]*"/gi,
    /<[^>]*class="[^"]*badge[^"]*"/gi,
    /<[^>]*class="[^"]*secure[^"]*"/gi,
    /<[^>]*class="[^"]*trust[^"]*"/gi
  ];
  
  let trustCount = 0;
  const seenTrustElements = new Set();
  
  // Count distinct trust elements
  trustElements.forEach(element => {
    const regex = new RegExp(`<[^>]*>([^<]*${element}[^<]*)</[^>]*>`, 'gi');
    const matches = html.match(regex) || [];
    matches.forEach(match => {
      const normalized = match.toLowerCase().replace(/\s+/g, '');
      if (!seenTrustElements.has(normalized)) {
        seenTrustElements.add(normalized);
        trustCount++;
      }
    });
  });
  
  // Count trust selectors
  trustSelectors.forEach(selector => {
    const matches = html.match(selector) || [];
    matches.forEach(match => {
      const normalized = match.toLowerCase().replace(/\s+/g, '');
      if (!seenTrustElements.has(normalized)) {
        seenTrustElements.add(normalized);
        trustCount++;
      }
    });
  });
  
  // Also count traditional trust markers
  const testimonialMatches = html.match(/class="[^"]*(?:testimonial|review|quote)[^"]*"/gi) || [];
  const securityMatches = html.match(/class="[^"]*(?:security|trust|badge|certified)[^"]*"/gi) || [];
  const logoMatches = html.match(/class="[^"]*(?:logo|customer|client)[^"]*"/gi) || [];
  
  const testimonials = testimonialMatches.length;
  const securityBadges = securityMatches.length;
  const customerLogos = logoMatches.length;
  const totalTrust = testimonials + securityBadges + customerLogos + trustCount;
  
  const trustDetected = totalTrust >= 2;
  
  // Enhanced signup speed estimation
  const inputMatches = html.match(/<input[^>]*>/gi) || [];
  const selectMatches = html.match(/<select[^>]*>/gi) || [];
  const textareaMatches = html.match(/<textarea[^>]*>/gi) || [];
  const requiredMatches = html.match(/required/gi) || [];
  
  const formFields = inputMatches.length + selectMatches.length + textareaMatches.length;
  const requiredFields = requiredMatches.length;
  
  // Count time cues
  const timeCues = ['<2 min', '2 minutes', 'no credit card', 'free', 'instant', 'quick', 'fast', 'easy'];
  const hasTimeCue = timeCues.some(cue =>
    textContent.toLowerCase().includes(cue.toLowerCase())
  );
  
  const estimatedSeconds = Math.max(formFields * 5, requiredFields * 10, 30);
  const signupSpeedGood = requiredFields <= 3 || (requiredFields <= 5 && hasTimeCue);
  
  return {
    h_cta_above_fold: { detected: ctaDetected, position: 50, element: 'button' },
    h_steps_count: { total: totalSteps, forms, has_wizard: hasWizard, steps_good: stepsCountGood },
    h_copy_clarity: { avg_sentence_length: avgSentenceLength, passive_voice_ratio: passiveVoiceRatio, jargon_density: jargonDensity, has_wall_of_text: hasWallOfText, has_benefit_h1: hasBenefitH1, copy_good: copyClarityGood },
    h_trust_markers: { testimonials, security_badges: securityBadges, customer_logos: customerLogos, total: totalTrust, trust_count: trustCount, trust_detected: trustDetected },
    h_perceived_signup_speed: { form_fields: formFields, required_fields: requiredFields, estimated_seconds: estimatedSeconds, has_time_cue: hasTimeCue, speed_good: signupSpeedGood }
  };
}

/**
 * Calculate scores from heuristics
 */
function calculateScores(heuristics) {
  // H-CTA-ABOVE-FOLD: 100% if detected, 0% if not
  const ctaScore = heuristics.h_cta_above_fold.detected ? 100 : 0;
  
  // H-STEPS-COUNT: Use enhanced logic with wizard detection and quick setup caps
  let stepsScore = 100;
  if (heuristics.h_steps_count.steps_good) {
    stepsScore = 100;
  } else if (heuristics.h_steps_count.total <= 3) {
    stepsScore = 100;
  } else if (heuristics.h_steps_count.total <= 5) {
    stepsScore = 80;
  } else if (heuristics.h_steps_count.total <= 7) {
    stepsScore = 60;
  } else {
    stepsScore = 40;
  }
  
  // H-COPY-CLARITY: Use enhanced logic with wall of text detection and benefit-led H1
  let copyScore = 100;
  if (heuristics.h_copy_clarity.copy_good) {
    copyScore = 100;
  } else if (heuristics.h_copy_clarity.has_wall_of_text) {
    copyScore = 40;
  } else if (heuristics.h_copy_clarity.has_benefit_h1) {
    copyScore = 90;
  } else {
    // Fallback to traditional metrics
    copyScore = 100;
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
  }
  
  // H-TRUST-MARKERS: Use enhanced logic with distinct trust element counting
  let trustScore = 40;
  if (heuristics.h_trust_markers.trust_detected) {
    trustScore = 100;
  } else if (heuristics.h_trust_markers.total >= 3) {
    trustScore = 100;
  } else if (heuristics.h_trust_markers.total === 2) {
    trustScore = 80;
  } else if (heuristics.h_trust_markers.total === 1) {
    trustScore = 60;
  }
  
  // H-PERCEIVED-SIGNUP-SPEED: Use enhanced logic with time cues
  let speedScore = 40;
  if (heuristics.h_perceived_signup_speed.speed_good) {
    speedScore = 100;
  } else if (heuristics.h_perceived_signup_speed.estimated_seconds < 30) {
    speedScore = 100;
  } else if (heuristics.h_perceived_signup_speed.estimated_seconds < 60) {
    speedScore = 80;
  } else if (heuristics.h_perceived_signup_speed.estimated_seconds < 120) {
    speedScore = 60;
  }
  
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

/**
 * Main scoring function that analyzes HTML and returns score + checks
 */
async function scoreHTML(html) {
  // Analyze HTML to get heuristics
  const heuristics = analyzeHTML(html);
  
  // Calculate scores from heuristics
  const scores = calculateScores(heuristics);
  
  // Convert scores to boolean checks (threshold: >= 60 for pass)
  const checks = {
    h_cta_above_fold: scores.h_cta_above_fold >= 60,
    h_steps_count: scores.h_steps_count >= 60,
    h_copy_clarity: scores.h_copy_clarity >= 60,
    h_trust_markers: scores.h_trust_markers >= 60,
    h_perceived_signup_speed: scores.h_perceived_signup_speed >= 60
  };
  
  // For now, raw score is the same as overall score (will be updated when heuristics are improved)
  const score_raw = scores.overall;
  const score_calibrated = scores.overall; // Will apply calibration later
  
  return {
    score: score_calibrated, // Primary score is calibrated
    score_raw: score_raw,
    score_calibrated: score_calibrated,
    checks
  };
}

// Export for use in other modules
export { scoreHTML, analyzeHTML, calculateScores };