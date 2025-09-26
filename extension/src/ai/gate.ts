/**
 * AI Gate - Controls access to AI features
 * Ensures AI features are only used when explicitly enabled by the user
 */

import { AI_ENABLED, AI_DISCLOSURE_TEXT } from '../config';

/**
 * Custom error class for AI disabled errors
 */
export class AIDisabledError extends Error {
  constructor(message: string = 'AI features are disabled. Enable AI features in settings to use this functionality.') {
    super(message);
    this.name = 'AIDisabledError';
  }
}

/**
 * Asserts that AI features are enabled
 * Throws AIDisabledError if AI is disabled
 */
export function assertAIEnabled(): void {
  if (!AI_ENABLED) {
    throw new AIDisabledError();
  }
}

/**
 * Checks if AI features are enabled without throwing
 * @returns true if AI is enabled, false otherwise
 */
export function isAIEnabled(): boolean {
  return AI_ENABLED;
}

/**
 * Gets the AI disclosure text that explains what data is sent when AI is enabled
 * @returns The disclosure text
 */
export function getAIDisclosureText(): string {
  return AI_DISCLOSURE_TEXT;
}