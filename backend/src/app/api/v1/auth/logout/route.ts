import { NextRequest, NextResponse } from 'next/server';

/**
 * @todo Implement logout flow
 * - Clear session/JWT
 * - Return success response
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}