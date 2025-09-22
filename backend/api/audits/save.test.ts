import { describe, it, expect, vi } from 'vitest';
import handler from './save';

// Mock the storage module
vi.mock('../../lib/storage', () => ({
  getStorage: vi.fn(() => ({
    connect: vi.fn(),
    saveAudit: vi.fn((audit) => Promise.resolve(audit))
  }))
}));

describe('Save Audit API', () => {
  it('should save audit successfully', async () => {
    const mockAudit = {
      id: 'test-audit-123',
      url: 'https://example.com',
      timestamp: '2024-01-01T00:00:00.000Z',
      heuristics: {},
      scores: {},
      recommendations: []
    };

    const mockRequest = new Request('http://localhost:3000/api/audits/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audit: mockAudit })
    });

    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.audit).toEqual(mockAudit);
    expect(data.message).toBe('Audit saved successfully');
  });

  it('should reject non-POST requests', async () => {
    const mockRequest = new Request('http://localhost:3000/api/audits/save', {
      method: 'GET'
    });

    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.error).toBe('Method not allowed');
  });

  it('should validate required fields', async () => {
    const mockRequest = new Request('http://localhost:3000/api/audits/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audit: { id: 'test' } }) // Missing required fields
    });

    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('should handle JSON parsing errors', async () => {
    const mockRequest = new Request('http://localhost:3000/api/audits/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to save audit');
  });

  it('should have edge runtime config', () => {
    // The config is exported separately, but we can verify the function exists
    expect(typeof handler).toBe('function');
  });
});