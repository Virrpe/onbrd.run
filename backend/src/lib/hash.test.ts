import { describe, it, expect } from 'vitest';
import { urlHash } from './hash';

describe('Hash Utilities', () => {
  describe('urlHash', () => {
    it('should create a hash with salt, origin, and pathname', () => {
      const result = urlHash('https://example.com', '/test/path');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64); // SHA256 hex length
    });

    it('should create consistent hashes for identical inputs', () => {
      const result1 = urlHash('https://example.com', '/test/path');
      const result2 = urlHash('https://example.com', '/test/path');
      
      expect(result1).toBe(result2);
    });

    it('should create different hashes for different origins', () => {
      const result1 = urlHash('https://example.com', '/test/path');
      const result2 = urlHash('https://different.com', '/test/path');
      
      expect(result1).not.toBe(result2);
    });

    it('should create different hashes for different pathnames', () => {
      const result1 = urlHash('https://example.com', '/test/path1');
      const result2 = urlHash('https://example.com', '/test/path2');
      
      expect(result1).not.toBe(result2);
    });

    it('should handle empty pathname', () => {
      const result = urlHash('https://example.com', '');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle root pathname', () => {
      const result = urlHash('https://example.com', '/');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle complex pathnames with special characters', () => {
      const result = urlHash('https://example.com', '/path/with spaces/and-special@chars');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle different protocols', () => {
      const result1 = urlHash('http://example.com', '/test');
      const result2 = urlHash('https://example.com', '/test');
      
      expect(result1).not.toBe(result2);
    });

    it('should handle subdomains', () => {
      const result1 = urlHash('https://www.example.com', '/test');
      const result2 = urlHash('https://sub.example.com', '/test');
      
      expect(result1).not.toBe(result2);
    });

    it('should handle ports in origin', () => {
      const result = urlHash('https://example.com:8080', '/test');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle query parameters in pathname', () => {
      const result = urlHash('https://example.com', '/test?param=value&other=test');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle hash fragments in pathname', () => {
      const result = urlHash('https://example.com', '/test#section');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle unicode characters in origin', () => {
      const result = urlHash('https://例え.jp', '/test');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle unicode characters in pathname', () => {
      const result = urlHash('https://example.com', '/测试/路径');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle very long origins', () => {
      const longOrigin = 'https://' + 'a'.repeat(100) + '.com';
      const result = urlHash(longOrigin, '/test');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle very long pathnames', () => {
      const longPathname = '/' + 'path/'.repeat(100) + 'end';
      const result = urlHash('https://example.com', longPathname);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle numeric origins', () => {
      const result = urlHash('https://192.168.1.1', '/test');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle IPv6 addresses', () => {
      const result = urlHash('https://[2001:db8::1]', '/test');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });
  });
});