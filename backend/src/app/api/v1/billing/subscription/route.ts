import { NextRequest, NextResponse } from 'next/server';

/**
 * @todo Implement subscription management
 * - Get current subscription status
 * - Handle upgrade/downgrade
 * - Return subscription details
 */
export async function GET(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}