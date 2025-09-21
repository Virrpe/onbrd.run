import { NextRequest, NextResponse } from 'next/server';

/**
 * @todo Implement session management
 * - Validate JWT/session token
 * - Return user info if valid
 * - Return 401 if invalid/expired
 */
export async function GET(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}