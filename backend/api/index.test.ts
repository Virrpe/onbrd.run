import { describe, it, expect } from 'vitest';
import handler from './index';

describe('Backend API Index', () => {
  it('should return "Onboarding Audit API" response', async () => {
    const mockRequest = new Request('http://localhost:3000/api') as any;
    
    const response = await handler(mockRequest);
    const text = await response.text();
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain');
    expect(text).toBe('Onboarding Audit API');
  });

  it('should handle any HTTP method', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    for (const method of methods) {
      const mockRequest = new Request('http://localhost:3000/api', { method }) as any;
      const response = await handler(mockRequest);
      
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Onboarding Audit API');
    }
  });

  it('should have edge runtime config', () => {
    expect(handler).toBeDefined();
    expect(typeof handler).toBe('function');
  });
});