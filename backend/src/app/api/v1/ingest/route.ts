import { NextRequest } from 'next/server';
import { q } from '../../../../lib/db';
import { IngestSchema } from '../../../../lib/zod';

export const dynamic = 'force-dynamic';

// Simple rate limiting: 5 requests per minute per IP
const rateLimit = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + 60 * 1000 });
    return true;
  }
  
  if (entry.count >= 5) {
    return false;
  }
  
  entry.count++;
  return true;
}

async function percentileOf(score: number): Promise<{percentile:number, median:number, count:number}> {
  const rows = await q<{ score: number }>('select score from audits order by created_at desc limit 1000');
  const arr: number[] = rows.map((r: { score: number }) => r.score).sort((a: number, b: number) => a - b);
  const count = arr.length || 1;
  const median = arr.length ? (arr[Math.floor((arr.length-1)/2)] + arr[Math.ceil((arr.length-1)/2)]) / 2 : score;
  const below = arr.filter((s: number) => s <= score).length;
  const percentile = Math.round((below / count) * 100);
  return { percentile, median: Math.round(median), count };
}

export async function POST(req: NextRequest) {
  try {
    // CORS headers
    const headers = {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    };

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Check rate limit
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers });
    }

    const body = await req.json();
    const parsed = IngestSchema.safeParse(body);
    if (!parsed.success) return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers });

    const { audit_id, url_hash, score, metrics, user_agent, created_at } = parsed.data;
    await q('insert into audits (audit_id, url_hash, score, metrics, ua, ts) values ($1,$2,$3,$4,$5,$6) on conflict (audit_id) do nothing',
      [audit_id, url_hash || null, score, metrics, user_agent || null, created_at || new Date().toISOString()]);

    const stats = await percentileOf(score);
    return new Response(JSON.stringify({ status: 'accepted', ...stats }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: 'server_error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}