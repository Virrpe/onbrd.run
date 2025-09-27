/**
 * Environment interfaces for deterministic scoring
 */

export interface Clock {
  now(): number;
}

export interface Env {
  clock: Clock;
  random: () => number;
}

/**
 * Deterministic PRNG implementation using a simple linear congruential generator
 * This ensures reproducible results for the same seed
 */
export class DeterministicPRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next random number in [0, 1) range
   * Uses a simple LCG algorithm for deterministic results
   */
  next(): number {
    // LCG parameters from Numerical Recipes
    this.seed = (this.seed * 1664525 + 1013904223) % 0x100000000;
    return this.seed / 0x100000000;
  }
}

/**
 * Create a deterministic clock that returns fixed timestamps
 */
export class FixedClock implements Clock {
  constructor(private timestamp: number) {}

  now(): number {
    return this.timestamp;
  }
}

/**
 * Create a real clock that uses Date.now()
 */
export class RealClock implements Clock {
  now(): number {
    return Date.now();
  }
}

/**
 * Create environment with deterministic or real implementations
 */
export function makeEnv(options: {
  deterministic?: boolean;
  seed?: number;
  timestamp?: number;
} = {}): Env {
  const { deterministic = false, seed = 12345, timestamp = 1609459200000 } = options;

  if (deterministic) {
    const prng = new DeterministicPRNG(seed);
    const clock = new FixedClock(timestamp);
    
    return {
      clock,
      random: () => prng.next()
    };
  } else {
    const clock = new RealClock();
    
    return {
      clock,
      random: () => Math.random()
    };
  }
}