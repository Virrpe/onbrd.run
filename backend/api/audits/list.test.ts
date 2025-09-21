import { describe, it, expect, vi } from 'vitest';
import handler from './list';

// Mock the storage module
vi.mock('../../lib/storage', () => ({
  getStorage: vi.fn(() => ({
    connect: vi.fn(),
    listAudits: vi.fn(() => Promise.resolve([])),
    countAudits: vi.fn(() => Promise.resolve(0))
  }))
}));

describe('List Audits API', () => {
  it('should list audits successfully', async () => {
    const mockRequest = new Request('http://localhost:3000/api/audits/list?userId=user123&page=1&limit=10');
    
    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.audits).toEqual([]);
    expect(data.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    });
  });

  it('should reject non-GET requests', async () => {
    const mockRequest = new Request('http://localhost:3000/api/audits/list', {
      method: 'POST'
    });

    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.error).toBe('Method not allowed');
  });

  it('should require userId parameter', async () => {
    const mockRequest = new Request('http://localhost:3000/api/audits/list');
    
    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User ID is required');
  });

  it('should handle custom pagination parameters', async () => {
    const mockRequest = new Request('http://localhost:3000/api/audits/list?userId=user123&page=2&limit=20');
    
    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(20);
  });

  it('should handle missing pagination parameters', async () => {
    const mockRequest = new Request('http://localhost:3000/api/audits/list?userId=user123');
    
    const response = await handler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
  });

  it('should have edge runtime config', () => {
    expect(typeof handler).toBe('function');
  });
});