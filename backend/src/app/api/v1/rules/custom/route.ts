import { NextRequest, NextResponse } from 'next/server';

/**
 * @todo Implement custom rule management
 * - GET: List user's custom rules
 * - POST: Create new custom rule
 * - Handle rule validation and storage
 */
export async function GET(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}