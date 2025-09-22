import { NextRequest, NextResponse } from 'next/server';

/**
 * @todo Implement Stripe webhook handler
 * - Validate webhook signature
 * - Handle subscription events
 * - Update user subscription status
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}