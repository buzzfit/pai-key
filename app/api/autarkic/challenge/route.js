import { NextResponse } from 'next/server';
import { createNonce, createSessionId, storeChallenge } from '../../../../lib/autarkicAuth';

export const dynamic = 'force-dynamic';

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
