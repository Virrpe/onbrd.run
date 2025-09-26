/**
 * Deterministic scoring system for the extension
 */

import { Env } from '../env';
import { clamp } from '../util/normalize';
import { getBuildMetadata } from '../util/build-metadata';

// Rule weights from the core system
// Rule weights are now passed in as parameters to make the function more flexible

export interface ScoringResult {
  score: number;
  passedRules: string[];
  failedRules: string[];
  ruleScores: Record<string, number>;
}

/**
 * Calculate deterministic score based on rule results
 * Uses environment for any random/timestamp needs
 */
export function calculateScore(
  rules: Array<{ id: string; weight: number }>,
  metrics: Record<string, boolean>,
  _env: Env
): ScoringResult & { buildMetadata?: any } {
  const ruleScores: Record<string, number> = {};
  let totalScore = 0;
  const passedRules: string[] = [];
  const failedRules: string[] = [];

  // Calculate individual rule scores
  for (const rule of rules) {
    const passed = metrics[rule.id] || false;
    const ruleScore = passed ? rule.weight * 100 : 0;
    
    ruleScores[rule.id] = Math.round(ruleScore);
    totalScore += passed ? rule.weight : 0;
    
    if (passed) {
      passedRules.push(rule.id);
    } else {
      failedRules.push(rule.id);
    }
  }

  // Convert to 0-100 scale and round
  const finalScore = Math.round(totalScore * 100);

  // Get build metadata for transparency
  const buildMetadata = getBuildMetadata();

  return {
    score: clamp(finalScore, 0, 100),
    passedRules,
    failedRules,
    ruleScores,
    buildMetadata
  };
}

/**
 * Generate deterministic recommendations based on failed rules
 */
export function generateRecommendations(
  rules: Array<{ id: string; weight: number; fix: string; confidence?: string }>,
  failedRules: string[],
  _env: Env
): Array<{
  ruleId: string;
  priority: 'high' | 'medium' | 'low';
  fix: string;
  confidence: string;
}> {
  const recommendations: Array<{
    ruleId: string;
    priority: 'high' | 'medium' | 'low';
    fix: string;
    confidence: string;
  }> = [];

  // Sort failed rules by weight (highest first)
  const sortedFailedRules = failedRules
    .map(ruleId => {
      const rule = rules.find(r => r.id === ruleId);
      return { ruleId, weight: rule?.weight || 0, fix: rule?.fix || '', confidence: rule?.confidence || 'medium' };
    })
    .sort((a, b) => b.weight - a.weight);

  // Generate recommendations
  for (const failedRule of sortedFailedRules) {
    let priority: 'high' | 'medium' | 'low' = 'medium';
    
    if (failedRule.weight >= 0.08) {
      priority = 'high';
    } else if (failedRule.weight <= 0.03) {
      priority = 'low';
    }

    recommendations.push({
      ruleId: failedRule.ruleId,
      priority,
      fix: failedRule.fix,
      confidence: failedRule.confidence
    });
  }

  return recommendations;
}

/**
 * Get score color class based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get score label based on score
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Create deterministic audit ID
 */
export function generateAuditId(env: Env): string {
  const timestamp = env.clock.now();
  const randomPart = Math.floor(env.random() * 1000000000).toString(36);
  return `audit-${timestamp}-${randomPart}`;
}