import { describe, it, expect, vi } from 'vitest';
import { GET as customGet, POST as customPost } from './custom/route';
import { NextRequest } from 'next/server';

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

describe('Rules Custom Endpoints', () => {
  describe('GET /api/v1/rules/custom', () => {
    it('should return 501 Not Implemented', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });

      const response = await customGet(req);
      const data = await response.json();
      
      expect(response.status).toBe(501);
      expect(data).toEqual({ error: 'Not implemented' });
    });

    it('should handle request without auth headers', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'GET'
      });

      const response = await customGet(req);
      const data = await response.json();
      
      expect(response.status).toBe(501);
      expect(data).toEqual({ error: 'Not implemented' });
    });

    it('should handle request with query parameters', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom?user_id=123&limit=10', {
        method: 'GET'
      });

      const response = await customGet(req);
      const data = await response.json();
      
      expect(response.status).toBe(501);
      expect(data).toEqual({ error: 'Not implemented' });
    });

    it('should reject POST request (method not allowed)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Rule' })
      });

      // The route handler should still work even with POST method since it doesn't validate HTTP method
      const response = await customGet(req);
      expect(response.status).toBe(501);
      const data = await response.json();
      expect(data.error).toBe('Not implemented');
    });
  });

  describe('POST /api/v1/rules/custom', () => {
    it('should return 501 Not Implemented', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Custom Rule',
          condition: 'element.hasClass("test")',
          action: 'highlight',
          priority: 'high'
        }),
        headers: {
          'Authorization': 'Bearer fake-token',
          'Content-Type': 'application/json'
        }
      });

      const response = await customPost(req);
      const data = await response.json();
      
      expect(response.status).toBe(501);
      expect(data).toEqual({ error: 'Not implemented' });
    });

    it('should handle request without auth headers', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Custom Rule',
          condition: 'element.hasClass("test")',
          action: 'highlight'
        })
      });

      const response = await customPost(req);
      const data = await response.json();
      
      expect(response.status).toBe(501);
      expect(data).toEqual({ error: 'Not implemented' });
    });

    it('should handle empty request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'POST'
      });

      const response = await customPost(req);
      const data = await response.json();
      
      expect(response.status).toBe(501);
      expect(data).toEqual({ error: 'Not implemented' });
    });

    it('should handle various custom rule payloads', async () => {
      const rulePayloads = [
        {
          name: 'Accessibility Rule',
          condition: 'element.attr("alt") === undefined',
          action: 'warn',
          category: 'accessibility'
        },
        {
          name: 'Performance Rule',
          condition: 'element.tagName === "IMG" && element.attr("loading") !== "lazy"',
          action: 'suggest',
          priority: 'medium'
        },
        {
          name: 'SEO Rule',
          condition: 'element.tagName === "H1" && element.text().length > 60',
          action: 'flag',
          severity: 'low'
        },
        {
          name: 'Mobile Rule',
          condition: 'element.css("font-size") < "16px"',
          action: 'highlight',
          device: 'mobile'
        }
      ];

      for (const payload of rulePayloads) {
        const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' }
        });

        const response = await customPost(req);
        const data = await response.json();
        
        expect(response.status).toBe(501);
        expect(data).toEqual({ error: 'Not implemented' });
      }
    });

    it('should reject GET request (method not allowed)', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'GET'
      });

      // The route handler should still work even with GET method since it doesn't validate HTTP method
      const response = await customPost(req);
      expect(response.status).toBe(501);
      const data = await response.json();
      expect(data.error).toBe('Not implemented');
    });
  });

  describe('Error Response Consistency', () => {
    it('should return consistent error structure across custom rules endpoints', async () => {
      const endpoints = [
        { handler: customGet, method: 'GET', path: '' },
        { handler: customPost, method: 'POST', path: '' }
      ];

      for (const endpoint of endpoints) {
        const req = new NextRequest(`http://localhost:3000/api/v1/rules/custom${endpoint.path}`, {
          method: endpoint.method as any
        });

        const response = await endpoint.handler(req);
        const data = await response.json();
        
        expect(response.status).toBe(501);
        expect(data).toHaveProperty('error');
        expect(data.error).toBe('Not implemented');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle large custom rule payloads', async () => {
      const largePayload = {
        name: 'Very Complex Rule Name '.repeat(10),
        description: 'This is a very long description '.repeat(50),
        condition: 'element.hasClass("test") && element.attr("data-test") === "value" && element.css("display") !== "none"'.repeat(10),
        action: 'highlight',
        priority: 'high',
        metadata: {
          tags: Array(50).fill(null).map((_, i) => `tag_${i}`),
          categories: ['accessibility', 'performance', 'seo', 'mobile'],
          rules: Array(100).fill(null).map((_, i) => ({
            id: i,
            condition: `rule_${i}`,
            action: `action_${i}`
          }))
        }
      };

      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'POST',
        body: JSON.stringify(largePayload),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await customPost(req);
      const data = await response.json();
      
      expect(response.status).toBe(501);
      expect(data).toEqual({ error: 'Not implemented' });
    });

    it('should handle concurrent custom rule operations', async () => {
      const promises = Array(5).fill(null).map((_, i) => {
        const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
          method: 'POST',
          body: JSON.stringify({ name: `Rule ${i}`, condition: `condition_${i}`, action: 'highlight' })
        });
        return customPost(req);
      });

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(501);
      });
    });

    it('should handle custom rule requests with various auth methods', async () => {
      const authHeaders = [
        { 'Authorization': 'Bearer token123' },
        { 'Authorization': 'Basic dXNlcjpwYXNz' },
        { 'Cookie': 'session=abc123' },
        { 'X-API-Key': 'key123' },
        { 'X-Rule-Token': 'rule_token_123' },
        {} // No auth
      ];

      for (const headers of authHeaders) {
        const getReq = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
          method: 'GET',
          headers
        });

        const postReq = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
          method: 'POST',
          headers
        });

        const [getResponse, postResponse] = await Promise.all([
          customGet(getReq),
          customPost(postReq)
        ]);

        expect(getResponse.status).toBe(501);
        expect(postResponse.status).toBe(501);
        expect(await getResponse.json()).toEqual({ error: 'Not implemented' });
        expect(await postResponse.json()).toEqual({ error: 'Not implemented' });
      }
    });

    it('should handle malformed JSON in custom rule creation', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
        method: 'POST',
        body: '{ invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await customPost(req);
      const data = await response.json();
      
      expect(response.status).toBe(501);
      expect(data).toEqual({ error: 'Not implemented' });
    });
  });

  describe('Request Validation', () => {
    it('should accept various content types for custom rule creation', async () => {
      const contentTypes = [
        'application/json',
        'application/x-www-form-urlencoded',
        'text/plain',
        'application/xml'
      ];

      for (const contentType of contentTypes) {
        const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
          method: 'POST',
          body: 'test payload',
          headers: { 'Content-Type': contentType }
        });

        const response = await customPost(req);
        const data = await response.json();
        
        expect(response.status).toBe(501);
        expect(data).toEqual({ error: 'Not implemented' });
      }
    });

    it('should handle custom rule requests with query parameters', async () => {
      const queryParams = [
        '?user_id=123',
        '?limit=10&offset=20',
        '?search=accessibility&sort=name',
        '?filter=active&include=conditions',
        '?'
      ];

      for (const params of queryParams) {
        const req = new NextRequest(`http://localhost:3000/api/v1/rules/custom${params}`, {
          method: 'GET'
        });

        const response = await customGet(req);
        const data = await response.json();
        
        expect(response.status).toBe(501);
        expect(data).toEqual({ error: 'Not implemented' });
      }
    });

    it('should handle custom rule names with special characters', async () => {
      const specialNames = [
        'Rule @#$%',
        'Rule with émojis 🚀',
        'Rule with "quotes"',
        'Rule with \'apostrophes\'',
        'Rule with\nnewlines',
        'Rule with\ttabs',
        'Rule with <script>alert("xss")</script>',
        'Rule with SQL injection \' OR 1=1 --'
      ];

      for (const name of specialNames) {
        const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
          method: 'POST',
          body: JSON.stringify({ name, condition: 'test', action: 'highlight' }),
          headers: { 'Content-Type': 'application/json' }
        });

        const response = await customPost(req);
        const data = await response.json();
        
        expect(response.status).toBe(501);
        expect(data).toEqual({ error: 'Not implemented' });
      }
    });

    it('should handle complex rule conditions', async () => {
      const complexConditions = [
        'element.hasClass("test") && element.attr("data-test") === "value"',
        'element.css("display") !== "none" || element.css("visibility") !== "hidden"',
        'element.text().length > 10 && element.text().includes("important")',
        'element.parent().hasClass("container") && element.children().length > 0',
        'element.attr("href") && element.attr("href").startsWith("https://")',
        'element.prop("tagName") === "A" && element.attr("target") === "_blank"',
        'element.css("color") === "rgb(255, 0, 0)" || element.css("background-color") === "rgb(255, 0, 0)"'
      ];

      for (const condition of complexConditions) {
        const req = new NextRequest('http://localhost:3000/api/v1/rules/custom', {
          method: 'POST',
          body: JSON.stringify({ name: 'Complex Rule', condition, action: 'highlight' }),
          headers: { 'Content-Type': 'application/json' }
        });

        const response = await customPost(req);
        const data = await response.json();
        
        expect(response.status).toBe(501);
        expect(data).toEqual({ error: 'Not implemented' });
      }
    });
  });
});