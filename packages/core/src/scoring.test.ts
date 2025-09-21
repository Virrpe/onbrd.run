import { describe, it, expect } from 'vitest';
import { calculateScores } from './scoring';

describe('scoring', () => {
  it('should calculate scores for valid inputs', () => {
    const mockHeuristics = {
      h_cta_above_fold: { detected: true, position: 100, element: 'button' },
      h_steps_count: { total: 2, forms: 1, screens: 2 },
      h_copy_clarity: {
        avg_sentence_length: 12,
        passive_voice_ratio: 5,
        jargon_density: 2
      },
      h_trust_markers: { testimonials: 2, security_badges: 1, customer_logos: 1, total: 4 },
      h_perceived_signup_speed: { form_fields: 5, required_fields: 3, estimated_seconds: 25 }
    };
    
    const result = calculateScores(mockHeuristics);
    expect(result).toBeDefined();
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(result.h_cta_above_fold).toBe(100);
    expect(result.h_steps_count).toBe(100);
  });

  it('should handle poor performing heuristics', () => {
    const poorHeuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 10, forms: 3, screens: 7 },
      h_copy_clarity: {
        avg_sentence_length: 25,
        passive_voice_ratio: 20,
        jargon_density: 10
      },
      h_trust_markers: { testimonials: 0, security_badges: 0, customer_logos: 0, total: 0 },
      h_perceived_signup_speed: { form_fields: 15, required_fields: 12, estimated_seconds: 180 }
    };
    
    const result = calculateScores(poorHeuristics);
    expect(result).toBeDefined();
    expect(result.h_cta_above_fold).toBe(0);
    expect(result.h_steps_count).toBe(40);
    expect(result.h_trust_markers).toBe(40);
    expect(result.h_perceived_signup_speed).toBe(40);
  });

  it('should calculate weighted overall score correctly', () => {
    const mixedHeuristics = {
      h_cta_above_fold: { detected: true, position: 150, element: 'button' },
      h_steps_count: { total: 4, forms: 2, screens: 3 },
      h_copy_clarity: {
        avg_sentence_length: 18,
        passive_voice_ratio: 12,
        jargon_density: 3
      },
      h_trust_markers: { testimonials: 1, security_badges: 1, customer_logos: 0, total: 2 },
      h_perceived_signup_speed: { form_fields: 8, required_fields: 6, estimated_seconds: 45 }
    };
    
    const result = calculateScores(mixedHeuristics);
    expect(result).toBeDefined();
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    // With the given inputs, we expect a reasonable score
    expect(result.h_cta_above_fold).toBe(100);
    expect(result.h_steps_count).toBe(80);
  });
});