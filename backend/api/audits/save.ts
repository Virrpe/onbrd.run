import { Audit } from '@onboarding-audit/core';
import { getStorage } from '../../lib/storage';

interface SaveRequest {
  audit: Audit;
}

interface SaveResponse {
  success: boolean;
  audit?: Audit;
  message?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: SaveRequest = await req.json();
    const audit = body.audit;
    
    // Validate against schema
    if (!audit.id || !audit.url || !audit.timestamp) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get storage instance
    const storage = getStorage();
    await storage.connect();
    
    // Save to database
    const savedAudit = await storage.saveAudit(audit);
    
    const result: SaveResponse = {
      success: true,
      audit: savedAudit,
      message: 'Audit saved successfully'
    };

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to save audit',
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