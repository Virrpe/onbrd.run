import { NextRequest, NextResponse } from 'next/server';

/**
 * @todo Implement login flow
 * - Accept email/password
 * - Validate credentials
 * - Issue JWT or session cookie
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}