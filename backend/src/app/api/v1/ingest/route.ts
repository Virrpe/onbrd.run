import { NextRequest, NextResponse } from 'next/server';
import { q } from '../../../../lib/db';
import { getBenchmarks } from '../../../../lib/stats';
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

    const { audit_id, url_hash, score, metrics, user_agent, device, cohort, region } = parsed.data;
    await q('insert into audits (audit_id, url_hash, score, metrics, ua, device, cohort, region, ts) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (audit_id) do nothing',
      [audit_id, url_hash || null, score, metrics, user_agent || null, device, cohort, region || null, new Date().toISOString()]);

    const stats = await getBenchmarks({ score: score, device: device, cohort: cohort });
    return NextResponse.json({ status: 'accepted', ...stats }, { headers: { 'Cache-Control': 'no-store' }});
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'bad-request' }, { status: 400 });
  }
}