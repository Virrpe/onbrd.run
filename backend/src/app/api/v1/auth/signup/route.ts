import { NextRequest, NextResponse } from 'next/server';

/**
 * @todo Implement signup flow
 * - Accept email/password
 * - Hash password + store user
 * - Issue JWT or session cookie
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}