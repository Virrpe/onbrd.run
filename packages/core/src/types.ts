// Core types for OnboardingAudit.ai

export interface Audit {
  id: string;
  url: string;
  timestamp: string;
  heuristics: Heuristics;
  scores: Scores;
  recommendations: Recommendation[];
}

export interface Heuristics {
  h_cta_above_fold: CTAHeuristic;
  h_steps_count: StepsHeuristic;
  h_copy_clarity: CopyHeuristic;
  h_trust_markers: TrustHeuristic;
  h_perceived_signup_speed: SpeedHeuristic;
}

export interface CTAHeuristic {
  detected: boolean;
  position: number;
  element: string;
}

export interface StepsHeuristic {
  total: number;
  forms: number;
  screens: number;
}

export interface CopyHeuristic {
  avg_sentence_length: number;
  passive_voice_ratio: number;
  jargon_density: number;
}

export interface TrustHeuristic {
  testimonials: number;
  security_badges: number;
  customer_logos: number;
  total: number;
}

export interface SpeedHeuristic {
  form_fields: number;
  required_fields: number;
  estimated_seconds: number;
}

export interface Scores {
  h_cta_above_fold: number;
  h_steps_count: number;
  h_copy_clarity: number;
  h_trust_markers: number;
  h_perceived_signup_speed: number;
  overall: number;
}

export interface Recommendation {
  heuristic: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  fix: string;
}

export interface AuditResult {
  success: boolean;
  data?: Audit;
  error?: string;
}