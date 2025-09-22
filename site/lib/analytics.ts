/**
 * Lightweight Analytics System for Hegel Sprint
 * Dependency-free event tracking with localStorage persistence in dev
 */

export interface AnalyticsEvent {
  name: string;
  payload?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  persistToLocalStorage: boolean;
  maxEvents: number;
  debug: boolean;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: false, // Default to false, will be enabled by feature flag
  persistToLocalStorage: true,
  maxEvents: 1000,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  const stored = sessionStorage.getItem('analytics_session_id');
  if (stored) {
    return stored;
  }
  
  const sessionId = generateSessionId();
  sessionStorage.setItem('analytics_session_id', sessionId);
  return sessionId;
}

/**
 * Get analytics events from localStorage
 */
function getStoredEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem('analytics_events');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to parse analytics events from localStorage:', error);
    return [];
  }
}

/**
 * Store analytics events to localStorage
 */
function storeEvents(events: AnalyticsEvent[]): void {
  if (!DEFAULT_CONFIG.persistToLocalStorage) return;
  
  try {
    const trimmed = events.slice(-DEFAULT_CONFIG.maxEvents);
    localStorage.setItem('analytics_events', JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to store analytics events to localStorage:', error);
  }
}

/**
 * Send event to backend (stub for now)
 */
async function sendToBackend(event: AnalyticsEvent): Promise<void> {
  // Stub implementation - returns 501 Not Implemented
  // This allows us to implement the client-side tracking now
  // and add backend integration later without breaking changes
  
  if (DEFAULT_CONFIG.debug) {
    console.log('[Analytics] Would send to backend:', event);
  }
  
  // Simulate API call with 501 response
  return Promise.resolve();
}

/**
 * Track an analytics event
 */
export async function track(eventName: string, payload?: Record<string, any>): Promise<void> {
  // Check if analytics is enabled via feature flag or config
  if (!DEFAULT_CONFIG.enabled) {
    // Try to check feature flag dynamically
    try {
      // Import feature flags dynamically to avoid circular dependencies
      const featureFlagsModule = await import('./featureFlags.ts');
      if (!featureFlagsModule.isFeatureEnabled('ANALYTICS_EVENTS')) {
        return;
      }
      // If feature flag is enabled, enable analytics
      DEFAULT_CONFIG.enabled = true;
    } catch (error) {
      // If feature flags module fails, fall back to default config
      return;
    }
  }
  
  const event: AnalyticsEvent = {
    name: eventName,
    payload: payload || {},
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };
  
  // Log to console in development
  if (DEFAULT_CONFIG.debug) {
    console.log(`[Analytics] ${eventName}:`, payload);
  }
  
  // Store in localStorage for development
  if (DEFAULT_CONFIG.persistToLocalStorage) {
    const events = getStoredEvents();
    events.push(event);
    storeEvents(events);
  }
  
  // Send to backend (stub)
  try {
    await sendToBackend(event);
  } catch (error) {
    console.warn('Failed to send analytics event to backend:', error);
  }
}

/**
 * Get all tracked events (for debugging)
 */
export function getEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

/**
 * Clear all stored events
 */
export function clearEvents(): void {
  localStorage.removeItem('analytics_events');
  
  if (DEFAULT_CONFIG.debug) {
    console.log('[Analytics] Cleared all events');
  }
}

/**
 * Export events as JSON (for analysis)
 */
export function exportEvents(): string {
  const events = getStoredEvents();
  return JSON.stringify(events, null, 2);
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary(): {
  totalEvents: number;
  eventsByName: Record<string, number>;
  firstEvent: number | null;
  lastEvent: number | null;
  uniqueSessions: number;
} {
  const events = getStoredEvents();
  
  if (events.length === 0) {
    return {
      totalEvents: 0,
      eventsByName: {},
      firstEvent: null,
      lastEvent: null,
      uniqueSessions: 0,
    };
  }
  
  const eventsByName: Record<string, number> = {};
  const sessions = new Set<string>();
  
  events.forEach(event => {
    eventsByName[event.name] = (eventsByName[event.name] || 0) + 1;
    sessions.add(event.sessionId);
  });
  
  return {
    totalEvents: events.length,
    eventsByName,
    firstEvent: events[0].timestamp,
    lastEvent: events[events.length - 1].timestamp,
    uniqueSessions: sessions.size,
  };
}

// Predefined event names for consistency
export const EVENT_NAMES = {
  // Track A: Funnel Instrumentation
  LP_VIEW: 'lp_view',
  DEMO_CLICK: 'demo_click',
  AUDIT_START: 'audit_start',
  SIGNUP_START: 'signup_start',
  SIGNUP_SUCCESS: 'signup_success',
  EXPORT_CLICK: 'export_click',
  
  // Track C: Pricing Intent
  UPGRADE_INTENT: 'upgrade_intent',
  PRICING_VIEW: 'pricing_view',
  
  // Track F: Marketing/SEO
  HEURISTICS_VIEW: 'heuristics_view',
} as const;

export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];

// Export type aliases for convenience
export type AnalyticsEventType = AnalyticsEvent;
export type AnalyticsConfigType = AnalyticsConfig;