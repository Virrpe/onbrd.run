/**
 * Text normalization utilities for deterministic processing
 */

/**
 * Normalize text by removing extra whitespace and converting to lowercase
 * This ensures consistent text processing across different environments
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .toLowerCase();
}

/**
 * Clamp a number between min and max values
 * Ensures deterministic bounds checking
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalize a score to a 0-100 range
 */
export function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.round(((value - min) / (max - min)) * 100);
}

/**
 * Round a number to a specified number of decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Remove non-alphanumeric characters from text
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(/[^a-zA-Z0-9\s]/g, '');
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim();
}