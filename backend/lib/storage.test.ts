import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Storage, getStorage } from './storage';
import { Audit } from '@onboarding-audit/core';

describe('Storage', () => {
  let storage: Storage;

  beforeEach(() => {
    // Reset singleton before each test
    vi.clearAllMocks();
    // @ts-expect-error - Accessing private property for testing
    storage = new Storage({});
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      const config = { url: 'test-url', authToken: 'test-token' };
      const storage = new Storage(config);
      expect(storage).toBeDefined();
    });

    it('should initialize with empty config', () => {
      const storage = new Storage({});
      expect(storage).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should connect to database successfully', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await storage.connect();
      
      expect(consoleSpy).toHaveBeenCalledWith('Connecting to database...');
      consoleSpy.mockRestore();
    });
  });

  describe('saveAudit', () => {
    it('should save audit successfully', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockAudit: Audit = {
        id: 'test-audit-123',
        url: 'https://example.com',
        timestamp: '2024-01-01T00:00:00.000Z',
        heuristics: {},
        scores: {},
        recommendations: []
      };

      const result = await storage.saveAudit(mockAudit);
      
      expect(consoleSpy).toHaveBeenCalledWith('Saving audit:', 'test-audit-123');
      expect(result).toEqual(mockAudit);
      consoleSpy.mockRestore();
    });
  });

  describe('listAudits', () => {
    it('should list audits with default pagination', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await storage.listAudits('user123');
      
      expect(consoleSpy).toHaveBeenCalledWith('Listing audits for user user123, page 1, limit 10');
      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });

    it('should list audits with custom pagination', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await storage.listAudits('user123', 2, 20);
      
      expect(consoleSpy).toHaveBeenCalledWith('Listing audits for user user123, page 2, limit 20');
      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('countAudits', () => {
    it('should count audits for user', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await storage.countAudits('user123');
      
      expect(consoleSpy).toHaveBeenCalledWith('Counting audits for user user123');
      expect(result).toBe(0);
      consoleSpy.mockRestore();
    });
  });

  describe('getAudit', () => {
    it('should get audit by ID', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await storage.getAudit('audit123');
      
      expect(consoleSpy).toHaveBeenCalledWith('Getting audit: audit123');
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('deleteAudit', () => {
    it('should delete audit by ID', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = await storage.deleteAudit('audit123');
      
      expect(consoleSpy).toHaveBeenCalledWith('Deleting audit: audit123');
      expect(result).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe('close', () => {
    it('should close database connection', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await storage.close();
      
      expect(consoleSpy).toHaveBeenCalledWith('Database connection closed');
      consoleSpy.mockRestore();
    });
  });
});

describe('getStorage', () => {
  it('should return singleton instance', () => {
    const storage1 = getStorage();
    const storage2 = getStorage();
    
    expect(storage1).toBe(storage2);
  });

  it('should create new instance with config', () => {
    const config = { url: 'test-url', authToken: 'test-token' };
    const storage = getStorage(config);
    
    expect(storage).toBeDefined();
  });
});