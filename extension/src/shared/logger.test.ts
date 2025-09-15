import { describe, it, expect } from 'vitest';
import { createLogger, popupLogger, backgroundLogger, contentLogger } from './logger';
import logger from '@core/logger';

describe('logger', () => {
  it('should create a custom logger', () => {
    const testLogger = createLogger('POPUP');
    expect(testLogger).toBeDefined();
    expect(typeof testLogger.start).toBe('function');
    expect(typeof testLogger.ok).toBe('function');
    expect(typeof testLogger.error).toBe('function');
  });

  it('should have pre-configured loggers', () => {
    expect(popupLogger).toBeDefined();
    expect(backgroundLogger).toBeDefined();
    expect(contentLogger).toBeDefined();
  });

  it('should log messages without throwing errors', () => {
    // This test just ensures that logging doesn't throw errors
    expect(() => {
      logger.log('Test log message');
      popupLogger.start('Popup test');
      backgroundLogger.ok('Background test');
      contentLogger.error('Content test');
    }).not.toThrow();
  });
});