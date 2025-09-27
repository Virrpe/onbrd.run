/**
 * Deterministic Linear Calibration Module for OnboardingAudit.ai
 * 
 * Implements linear calibration: S_cal = a * S_raw + b
 * where S_raw ∈ [0,100] and S_cal ∈ [0,100] (clamped)
 * 
 * Calibration weights {a, b} are computed once using OLS on training data
 * and stored in a frozen configuration file.
 */

export interface CalibrationConfig {
  a: number; // slope
  b: number; // intercept
  version: string;
  fitted_on: string;
  n_samples: number;
}

/**
 * Default calibration configuration (identity transform)
 * This will be replaced by fitted values from scripts/fit_calibration.mjs
 */
export const DEFAULT_CALIBRATION: CalibrationConfig = {
  a: 1.0,
  b: 0.0,
  version: "v0.2c",
  fitted_on: "not_fitted",
  n_samples: 0
};

/**
 * Apply linear calibration to raw score
 * S_cal = a * S_raw + b, clamped to [0, 100]
 */
export function applyCalibration(rawScore: number, config: CalibrationConfig): number {
  const calibrated = config.a * rawScore + config.b;
  return Math.max(0, Math.min(100, calibrated));
}

/**
 * Apply inverse calibration (for debugging/analysis)
 * S_raw = (S_cal - b) / a
 */
export function inverseCalibration(calibratedScore: number, config: CalibrationConfig): number {
  const raw = (calibratedScore - config.b) / config.a;
  return Math.max(0, Math.min(100, raw));
}

/**
 * Fit calibration parameters using Ordinary Least Squares (OLS)
 * Deterministic implementation with fixed math operations
 */
export function fitCalibrationOLS(
  rawScores: number[],
  targetScores: number[]
): { a: number; b: number } {
  if (rawScores.length !== targetScores.length) {
    throw new Error("Raw scores and target scores must have the same length");
  }
  
  if (rawScores.length < 2) {
    throw new Error("Need at least 2 samples to fit calibration");
  }

  const n = rawScores.length;
  
  // Calculate means
  const meanX = rawScores.reduce((sum, x) => sum + x, 0) / n;
  const meanY = targetScores.reduce((sum, y) => sum + y, 0) / n;
  
  // Calculate slope (a) and intercept (b) using OLS formulas
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = rawScores[i] - meanX;
    const yDiff = targetScores[i] - meanY;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }
  
  if (denominator === 0) {
    // All raw scores are the same, use identity transform
    return { a: 1.0, b: 0.0 };
  }
  
  const a = numerator / denominator;
  const b = meanY - a * meanX;
  
  return { a, b };
}

/**
 * Load calibration configuration from JSON
 */
export function loadCalibrationConfig(jsonString: string): CalibrationConfig {
  const config = JSON.parse(jsonString) as CalibrationConfig;
  
  // Validate required fields
  if (typeof config.a !== 'number' || typeof config.b !== 'number') {
    throw new Error("Invalid calibration config: a and b must be numbers");
  }
  
  if (config.n_samples < 0) {
    throw new Error("Invalid calibration config: n_samples must be non-negative");
  }
  
  return config;
}

/**
 * Save calibration configuration to JSON
 */
export function saveCalibrationConfig(config: CalibrationConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Create a calibrated scoring function
 */
export function createCalibratedScorer(
  rawScorer: (heuristics: any) => number,
  config: CalibrationConfig
): (heuristics: any) => number {
  return (heuristics: any) => {
    const rawScore = rawScorer(heuristics);
    return applyCalibration(rawScore, config);
  };
}