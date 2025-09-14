/**
 * Shared logger utility for OnboardingAudit.ai extension
 * Provides consistent logging across background, content, and popup scripts
 */

export type LogContext = 'POPUP' | 'BG' | 'CS';
export type LogLevel = 'START' | 'OK' | 'ERROR';

export interface Logger {
  start: (message: string) => void;
  ok: (message: string) => void;
  error: (message: string) => void;
}

/**
 * Creates a logger instance with the specified context
 * @param context - The context where the logger will be used (POPUP, BG, or CS)
 * @returns Logger instance with start, ok, and error methods
 */
export function createLogger(context: LogContext): Logger {
  const formatMessage = (level: LogLevel, message: string): string => {
    const timestamp = new Date().toISOString();
    return `[OA][${context}] ${level}: ${message} (${timestamp})`;
  };

  return {
    start: (message: string) => {
      console.log(formatMessage('START', message));
    },
    ok: (message: string) => {
      console.log(formatMessage('OK', message));
    },
    error: (message: string) => {
      console.error(formatMessage('ERROR', message));
    }
  };
}

/**
 * Pre-configured logger instances for each context
 */
export const popupLogger = createLogger('POPUP');
export const backgroundLogger = createLogger('BG');
export const contentLogger = createLogger('CS');

/**
 * Default logger (for backward compatibility or general use)
 */
export default createLogger('BG');