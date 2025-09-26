export const USE_BACKEND = false; // flip true later
export const API_BASE_URL = '';
export const RULES_TIMEOUT_MS = 300;
export const INGEST_TIMEOUT_MS = 2000;
export const MAX_RETRY = 5;
export const RETRY_BACKOFF_MINUTES = [1, 5, 15, 30, 60, 120]; // minutes for retry delays

// Privacy Local-Only Mode settings
export const LOCAL_ONLY = true; // Default to local-only mode
export const ALLOW_NETWORK = false; // Default to no network access

// AI Features settings - OFF by default for privacy
export const AI_ENABLED = false; // AI features are opt-in only
export const AI_DISCLOSURE_TEXT = "When enabled, AI features send page content to cloud services for analysis. This includes text, structure, and metadata from the audited page.";