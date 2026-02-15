import { NextResponse } from 'next/server';
import { createNonce, createSessionId, storeChallenge } from '../../../../lib/autarkicAuth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const account = body?.wallet?.trim() || body?.account?.trim() || null;
  const sessionId = body?.sessionId?.trim() || createSessionId();
  const challenge = createNonce();

  const { expiresAt, ttlSeconds } = await storeChallenge({
    challenge,
    account,
    sessionId,
  });

  return NextResponse.json({
    ok: true,
    challenge,
    wallet: account,
    account,
    sessionId,
    expiresAt,
    ttlSeconds,
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account') || null;
  const sessionId = searchParams.get('sessionId') || createSessionId();
  const challenge = createNonce();

  const { expiresAt, ttlSeconds } = await storeChallenge({
    challenge,
    account,
    sessionId,
  });

  return NextResponse.json({
    ok: true,
    challenge,
    account,
    sessionId,
    expiresAt,
    ttlSeconds,
  });
}
