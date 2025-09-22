/**
 * Feature Flags System for Hegel Sprint
 * Controls visibility of new features during development
 */

export interface FeatureFlags {
  // Track A: Funnel Instrumentation
  ANALYTICS_EVENTS: boolean;
  
  // Track B: Auth Spike
  AUTH_BETA: boolean;
  
  // Track C: Pricing Intent
  PRICING_INTENT_BETA: boolean;
  
  // Track D: Rule Packs
  RULE_PACKS_BETA: boolean;
}

/**
 * Default feature flag values
 * All features default to false in production
 */
const DEFAULT_FLAGS: FeatureFlags = {
  ANALYTICS_EVENTS: false,
  AUTH_BETA: false,
  PRICING_INTENT_BETA: false,
  RULE_PACKS_BETA: false,
};

/**
 * Environment-based feature flag configuration
 */
function getEnvironmentFlags(): Partial<FeatureFlags> {
  // Check if we're in development/preview environment
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname.includes('preview') ||
                window.location.hostname.includes('dev');
  
  const isPreview = window.location.hostname.includes('preview');
  
  if (isDev || isPreview) {
    return {
      ANALYTICS_EVENTS: true,
      AUTH_BETA: true,
      PRICING_INTENT_BETA: true,
      RULE_PACKS_BETA: true,
    };
  }
  
  return {};
}

/**
 * URL parameter override support
 * Allows enabling features via URL params for testing
 */
function getUrlParamFlags(): Partial<FeatureFlags> {
  const urlParams = new URLSearchParams(window.location.search);
  const flags: Partial<FeatureFlags> = {};
  
  if (urlParams.get('analytics') === 'true') {
    flags.ANALYTICS_EVENTS = true;
  }
  
  if (urlParams.get('auth') === 'true') {
    flags.AUTH_BETA = true;
  }
  
  if (urlParams.get('pricing') === 'true') {
    flags.PRICING_INTENT_BETA = true;
  }
  
  if (urlParams.get('packs') === 'true') {
    flags.RULE_PACKS_BETA = true;
  }
  
  return flags;
}

/**
 * Local storage override support
 * Persists feature flag preferences across sessions
 */
function getLocalStorageFlags(): Partial<FeatureFlags> {
  try {
    const stored = localStorage.getItem('featureFlags');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse feature flags from localStorage:', error);
  }
  
  return {};
}

/**
 * Merge all feature flag sources with priority:
 * 1. LocalStorage (highest priority)
 * 2. URL parameters
 * 3. Environment detection
 * 4. Default values (lowest priority)
 */
export function getFeatureFlags(): FeatureFlags {
  const envFlags = getEnvironmentFlags();
  const urlFlags = getUrlParamFlags();
  const storageFlags = getLocalStorageFlags();
  
  return {
    ...DEFAULT_FLAGS,
    ...envFlags,
    ...urlFlags,
    ...storageFlags,
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag];
}

/**
 * Update feature flags in localStorage
 */
export function setFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): void {
  try {
    const current = getLocalStorageFlags();
    const updated = { ...current, [flag]: enabled };
    localStorage.setItem('featureFlags', JSON.stringify(updated));
    
    // Dispatch custom event for reactive updates
    window.dispatchEvent(new CustomEvent('featureFlagsChanged', {
      detail: { flag, enabled, flags: getFeatureFlags() }
    }));
  } catch (error) {
    console.warn('Failed to save feature flag to localStorage:', error);
  }
}

/**
 * Reset all feature flags to defaults
 */
export function resetFeatureFlags(): void {
  try {
    localStorage.removeItem('featureFlags');
    
    // Dispatch custom event for reactive updates
    window.dispatchEvent(new CustomEvent('featureFlagsChanged', {
      detail: { flag: 'all', enabled: false, flags: getFeatureFlags() }
    }));
  } catch (error) {
    console.warn('Failed to reset feature flags:', error);
  }
}

/**
 * Get current feature flag state as string (for debugging)
 */
export function getFeatureFlagsDebug(): string {
  const flags = getFeatureFlags();
  return Object.entries(flags)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

// Export type alias for convenience
export type FeatureFlagsType = FeatureFlags;