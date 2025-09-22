import { describe, it, expect } from 'vitest';
import {
  calculateWeightedScore,
  calculateScores,
  generateIssues,
  generateRecommendations,
  getScoreColor,
  getScoreLabel
} from './scoring';
import { Heuristics } from './types';

describe('calculateWeightedScore', () => {
  it('should calculate weighted score for perfect heuristics', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: true, position: 100, element: 'button' },
      h_steps_count: { total: 2, forms: 1, screens: 1 },
      h_copy_clarity: { avg_sentence_length: 10, passive_voice_ratio: 5, jargon_density: 2 },
      h_trust_markers: { testimonials: 3, security_badges: 2, customer_logos: 1, total: 6 },
      h_perceived_signup_speed: { form_fields: 3, required_fields: 2, estimated_seconds: 25 }
    };

    const score = calculateWeightedScore(heuristics);
    expect(score).toBe(100);
  });

  it('should calculate weighted score for poor heuristics', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 10, forms: 5, screens: 5 },
      h_copy_clarity: { avg_sentence_length: 25, passive_voice_ratio: 20, jargon_density: 10 },
      h_trust_markers: { testimonials: 0, security_badges: 0, customer_logos: 0, total: 0 },
      h_perceived_signup_speed: { form_fields: 15, required_fields: 10, estimated_seconds: 180 }
    };

    const score = calculateWeightedScore(heuristics);
    expect(score).toBeLessThan(50);
  });

  it('should handle edge case with empty heuristics', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 1, forms: 0, screens: 0 },
      h_copy_clarity: { avg_sentence_length: 0, passive_voice_ratio: 0, jargon_density: 0 },
      h_trust_markers: { testimonials: 0, security_badges: 0, customer_logos: 0, total: 0 },
      h_perceived_signup_speed: { form_fields: 0, required_fields: 0, estimated_seconds: 30 }
    };

    const score = calculateWeightedScore(heuristics);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('calculateScores', () => {
  it('should return perfect scores for ideal heuristics', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: true, position: 100, element: 'button' },
      h_steps_count: { total: 2, forms: 1, screens: 1 },
      h_copy_clarity: { avg_sentence_length: 10, passive_voice_ratio: 5, jargon_density: 2 },
      h_trust_markers: { testimonials: 3, security_badges: 2, customer_logos: 1, total: 6 },
      h_perceived_signup_speed: { form_fields: 3, required_fields: 2, estimated_seconds: 25 }
    };

    const scores = calculateScores(heuristics);
    
    expect(scores.h_cta_above_fold).toBe(100);
    expect(scores.h_steps_count).toBe(100);
    expect(scores.h_copy_clarity).toBe(100);
    expect(scores.h_trust_markers).toBe(100);
    expect(scores.h_perceived_signup_speed).toBe(100);
    expect(scores.overall).toBe(100);
  });

  it('should handle boundary values correctly', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 3, forms: 1, screens: 1 },
      h_copy_clarity: { avg_sentence_length: 15, passive_voice_ratio: 10, jargon_density: 5 },
      h_trust_markers: { testimonials: 2, security_badges: 0, customer_logos: 0, total: 2 },
      h_perceived_signup_speed: { form_fields: 6, required_fields: 4, estimated_seconds: 59 }
    };

    const scores = calculateScores(heuristics);
    
    expect(scores.h_cta_above_fold).toBe(0);
    expect(scores.h_steps_count).toBe(100);
    expect(scores.h_copy_clarity).toBe(100);
    expect(scores.h_trust_markers).toBe(80);
    expect(scores.h_perceived_signup_speed).toBe(80);
  });

  it('should clamp copy clarity score to minimum 0', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 1, forms: 0, screens: 0 },
      h_copy_clarity: { avg_sentence_length: 50, passive_voice_ratio: 50, jargon_density: 20 },
      h_trust_markers: { testimonials: 0, security_badges: 0, customer_logos: 0, total: 0 },
      h_perceived_signup_speed: { form_fields: 0, required_fields: 0, estimated_seconds: 30 }
    };

    const scores = calculateScores(heuristics);
    expect(scores.h_copy_clarity).toBe(0);
  });

  it('should handle zero division in copy analysis', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 1, forms: 0, screens: 0 },
      h_copy_clarity: { avg_sentence_length: 0, passive_voice_ratio: 0, jargon_density: 0 },
      h_trust_markers: { testimonials: 0, security_badges: 0, customer_logos: 0, total: 0 },
      h_perceived_signup_speed: { form_fields: 0, required_fields: 0, estimated_seconds: 30 }
    };

    const scores = calculateScores(heuristics);
    expect(scores.h_copy_clarity).toBe(100);
  });
});

describe('generateIssues', () => {
  it('should generate no issues for perfect heuristics', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: true, position: 100, element: 'button' },
      h_steps_count: { total: 2, forms: 1, screens: 1 },
      h_copy_clarity: { avg_sentence_length: 10, passive_voice_ratio: 5, jargon_density: 2 },
      h_trust_markers: { testimonials: 3, security_badges: 2, customer_logos: 1, total: 6 },
      h_perceived_signup_speed: { form_fields: 3, required_fields: 2, estimated_seconds: 25 }
    };

    const issues = generateIssues(heuristics);
    expect(issues).toHaveLength(0);
  });

  it('should generate all possible issues for poor heuristics', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 10, forms: 5, screens: 5 },
      h_copy_clarity: { avg_sentence_length: 25, passive_voice_ratio: 20, jargon_density: 10 },
      h_trust_markers: { testimonials: 0, security_badges: 0, customer_logos: 0, total: 0 },
      h_perceived_signup_speed: { form_fields: 15, required_fields: 10, estimated_seconds: 180 }
    };

    const issues = generateIssues(heuristics);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(issue => issue.includes('No clear call-to-action'))).toBe(true);
    expect(issues.some(issue => issue.includes('10 steps'))).toBe(true);
    expect(issues.some(issue => issue.includes('25 words'))).toBe(true);
    expect(issues.some(issue => issue.includes('passive voice'))).toBe(true);
    expect(issues.some(issue => issue.includes('jargon'))).toBe(true);
    expect(issues.some(issue => issue.includes('trust signals'))).toBe(true);
    expect(issues.some(issue => issue.includes('180 seconds'))).toBe(true);
  });
});

describe('generateRecommendations', () => {
  it('should generate recommendations with correct structure', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 5, forms: 2, screens: 3 },
      h_copy_clarity: { avg_sentence_length: 20, passive_voice_ratio: 15, jargon_density: 8 },
      h_trust_markers: { testimonials: 1, security_badges: 0, customer_logos: 0, total: 1 },
      h_perceived_signup_speed: { form_fields: 8, required_fields: 6, estimated_seconds: 90 }
    };

    const recommendations = generateRecommendations(heuristics);
    
    expect(recommendations.length).toBeGreaterThan(0);
    recommendations.forEach(rec => {
      expect(rec).toHaveProperty('heuristic');
      expect(rec).toHaveProperty('priority');
      expect(rec).toHaveProperty('description');
      expect(rec).toHaveProperty('fix');
      expect(['low', 'medium', 'high']).toContain(rec.priority);
    });
  });

  it('should prioritize issues correctly', () => {
    const heuristics: Heuristics = {
      h_cta_above_fold: { detected: false, position: 0, element: '' },
      h_steps_count: { total: 10, forms: 5, screens: 5 },
      h_copy_clarity: { avg_sentence_length: 25, passive_voice_ratio: 20, jargon_density: 10 },
      h_trust_markers: { testimonials: 0, security_badges: 0, customer_logos: 0, total: 0 },
      h_perceived_signup_speed: { form_fields: 15, required_fields: 10, estimated_seconds: 180 }
    };

    const recommendations = generateRecommendations(heuristics);
    const highPriority = recommendations.filter(rec => rec.priority === 'high');
    const mediumPriority = recommendations.filter(rec => rec.priority === 'medium');
    const lowPriority = recommendations.filter(rec => rec.priority === 'low');
    
    expect(highPriority.length).toBeGreaterThan(0);
    expect(mediumPriority.length).toBeGreaterThan(0);
    expect(lowPriority.length).toBeGreaterThan(0);
  });
});

describe('getScoreColor', () => {
  it('should return correct color classes', () => {
    expect(getScoreColor(85)).toBe('text-green-600');
    expect(getScoreColor(75)).toBe('text-yellow-600');
    expect(getScoreColor(45)).toBe('text-red-600');
    expect(getScoreColor(60)).toBe('text-yellow-600');
    expect(getScoreColor(80)).toBe('text-green-600');
  });
});

describe('getScoreLabel', () => {
  it('should return correct labels', () => {
    expect(getScoreLabel(85)).toBe('Excellent');
    expect(getScoreLabel(75)).toBe('Good');
    expect(getScoreLabel(45)).toBe('Fair');
    expect(getScoreLabel(25)).toBe('Needs Improvement');
    expect(getScoreLabel(80)).toBe('Excellent');
    expect(getScoreLabel(60)).toBe('Good');
    expect(getScoreLabel(40)).toBe('Fair');
  });
});