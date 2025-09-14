// Audit import removed - not used in this file

interface ProxyRequest {
  url: string;
}

interface ProxyResponse {
  url: string;
  html: string;
  timestamp: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: ProxyRequest = await req.json();
    const { url } = body;
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch the public page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OnboardingAudit.ai/1.0.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    const result: ProxyResponse = {
      url,
      html,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch URL',
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