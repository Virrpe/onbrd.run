import { Audit } from '@onboarding-audit/core';
import { getStorage } from '../../lib/storage';

// Unused interface - removed for now

interface ListResponse {
  audits: Audit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get storage instance
    const storage = getStorage();
    await storage.connect();
    
    // Fetch from database
    const audits = await storage.listAudits(userId, page, limit);
    const total = await storage.countAudits(userId);
    
    const result: ListResponse = {
      audits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to list audits',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Export for Vercel Edge Functions
export const config = {
  runtime: 'edge',
};