import { Heuristics, Scores, Recommendation } from './types';

// Environment interface for deterministic operations
export interface Env {
  clock?: {
    now(): number;
  };
  random?: () => number;
}

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

export interface ScoringResult {
  overall: number;
  individual: Scores;
  issues: string[];
}

export function calculateWeightedScore(heuristics: Heuristics, env?: Env): number {
  const scores = calculateScores(heuristics, env);
  
  return Math.round(
    scores.h_cta_above_fold * HEURISTIC_WEIGHTS.h_cta_above_fold +
    scores.h_steps_count * HEURISTIC_WEIGHTS.h_steps_count +
    scores.h_copy_clarity * HEURISTIC_WEIGHTS.h_copy_clarity +
    scores.h_trust_markers * HEURISTIC_WEIGHTS.h_trust_markers +
    scores.h_perceived_signup_speed * HEURISTIC_WEIGHTS.h_perceived_signup_speed
  );
}

export function calculateScores(heuristics: Heuristics, _env?: Env): Scores {
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

export function generateIssues(heuristics: Heuristics, _env?: Env): string[] {
  const issues: string[] = [];
  
  // H-CTA-ABOVE-FOLD issue
  if (!heuristics.h_cta_above_fold.detected) {
    issues.push("No clear call-to-action found above the fold (top 600px)");
  }
  
  // H-STEPS-COUNT issue
  if (heuristics.h_steps_count.total > 3) {
    issues.push(`Onboarding flow has ${heuristics.h_steps_count.total} steps, which may cause friction and abandonment`);
  }
  
  // H-COPY-CLARITY issues
  if (heuristics.h_copy_clarity.avg_sentence_length > 15) {
    issues.push(`Average sentence length is ${heuristics.h_copy_clarity.avg_sentence_length} words, which may reduce comprehension`);
  }
  
  if (heuristics.h_copy_clarity.passive_voice_ratio > 10) {
    issues.push(`${heuristics.h_copy_clarity.passive_voice_ratio}% of sentences use passive voice, which can reduce clarity`);
  }
  
  if (heuristics.h_copy_clarity.jargon_density > 5) {
    issues.push(`${heuristics.h_copy_clarity.jargon_density}% of words are jargon, which may confuse users`);
  }
  
  // H-TRUST-MARKERS issue
  if (heuristics.h_trust_markers.total < 3) {
    issues.push(`Only ${heuristics.h_trust_markers.total} trust signals detected, which may reduce user confidence`);
  }
  
  // H-PERCEIVED-SIGNUP-SPEED issue
  if (heuristics.h_perceived_signup_speed.estimated_seconds > 60) {
    issues.push(`Signup process appears to take ${heuristics.h_perceived_signup_speed.estimated_seconds} seconds, which may cause abandonment`);
  }
  
  return issues;
}

export function generateRecommendations(heuristics: Heuristics, _env?: Env): Recommendation[] {
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

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}