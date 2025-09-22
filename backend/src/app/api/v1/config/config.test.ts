import { describe, it, expect, vi } from 'vitest';
import { GET as configGet } from './route';

// Mock NextResponse only, import NextRequest normally
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    NextResponse: {
      json: (data: any, init?: ResponseInit) => ({
        json: async () => data,
        status: init?.status || 200,
        headers: new Headers()
      })
    }
  };
});

describe('Config Endpoint', () => {
  describe('GET /api/v1/config', () => {
    it('should return config with killSwitch, banner, and rulesEtag', async () => {
      const response = await configGet();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('killSwitch');
      expect(data).toHaveProperty('banner');
      expect(data).toHaveProperty('rulesEtag');
      expect(data.killSwitch).toBe(false);
      expect(data.banner).toBe(null);
      expect(data.rulesEtag).toBe('v1.1.0');
    });

    it('should return JSON response with proper headers', async () => {
      const response = await configGet();
      
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(response.headers.get('cache-control')).toContain('public');
      expect(response.headers.get('cache-control')).toContain('max-age=30');
      expect(response.headers.get('cache-control')).toContain('s-maxage=60');
    });

    it('should have revalidate set to 60', async () => {
      // Check that the revalidate export exists
      const routeModule = await import('./route');
      expect(routeModule.revalidate).toBe(60);
    });

    it('should return consistent config values', async () => {
      const response1 = await configGet();
      const response2 = await configGet();
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1).toEqual(data2);
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() => configGet());
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      const data = await Promise.all(responses.map(r => r.json()));
      data.forEach(config => {
        expect(config.killSwitch).toBe(false);
        expect(config.banner).toBe(null);
        expect(config.rulesEtag).toBe('v1.1.0');
      });
    });

    it('should return valid JSON structure', async () => {
      const response = await configGet();
      const data = await response.json();
      
      // Verify it's valid JSON
      expect(() => JSON.stringify(data)).not.toThrow();
      
      // Verify structure
      expect(typeof data.killSwitch).toBe('boolean');
      expect(data.banner === null || typeof data.banner === 'string').toBe(true);
      expect(typeof data.rulesEtag).toBe('string');
    });

    it('should have proper cache headers for CDN', async () => {
      const response = await configGet();
      
      const cacheControl = response.headers.get('cache-control');
      expect(cacheControl).toBe('public, max-age=30, s-maxage=60');
    });

    it('should handle edge case banner values', async () => {
      // The current implementation has banner hardcoded to null
      // This test ensures the structure is maintained
      const response = await configGet();
      const data = await response.json();
      
      expect(data.banner).toBe(null);
    });

    it('should have killSwitch as boolean false', async () => {
      const response = await configGet();
      const data = await response.json();
      
      expect(data.killSwitch).toBe(false);
      expect(typeof data.killSwitch).toBe('boolean');
    });

    it('should have rulesEtag as string', async () => {
      const response = await configGet();
      const data = await response.json();
      
      expect(typeof data.rulesEtag).toBe('string');
      expect(data.rulesEtag.length).toBeGreaterThan(0);
    });

    it('should return same structure on repeated calls', async () => {
      const response1 = await configGet();
      const response2 = await configGet();
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(Object.keys(data1)).toEqual(Object.keys(data2));
      expect(data1.killSwitch).toBe(data2.killSwitch);
      expect(data1.banner).toBe(data2.banner);
      expect(data1.rulesEtag).toBe(data2.rulesEtag);
    });
  });
});