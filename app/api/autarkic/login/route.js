import { NextResponse } from 'next/server';
import {
  consumeChallenge,
  issueAgentToken,
  loadChallenge,
  verifyXrplSignature,
} from '../../../../lib/autarkicAuth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const account = body?.account?.trim();
  const publicKey = body?.publicKey?.trim();
  const challenge = body?.challenge?.trim();
  const signature = body?.signature?.trim();

  if (!account || !challenge || !signature) {
    return NextResponse.json({ ok: false, error: 'InvalidRequest' }, { status: 400 });
  }

  if (!publicKey) {
    return NextResponse.json(
      { ok: false, error: 'MissingPublicKey', detail: 'publicKey is required for autarkic login' },
      { status: 400 }
    );
  }

  const stored = await loadChallenge(challenge);
  if (!stored) {
    return NextResponse.json({ ok: false, error: 'ChallengeNotFoundOrExpired' }, { status: 401 });
  }

  if (stored.consumed) {
    return NextResponse.json({ ok: false, error: 'ChallengeAlreadyUsed' }, { status: 409 });
  }

  if (stored.expiresAt <= Date.now()) {
    return NextResponse.json({ ok: false, error: 'ChallengeExpired' }, { status: 401 });
  }

  if (stored.account && stored.account !== account) {
    return NextResponse.json({ ok: false, error: 'AccountChallengeMismatch' }, { status: 401 });
  }

  const valid = verifyXrplSignature({ account, publicKey, challenge, signature });
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'InvalidSignature' }, { status: 401 });
  }

  await consumeChallenge(challenge, stored);
  const { token, expiresIn } = issueAgentToken({
    account,
    sessionId: stored.sessionId,
    publicKey,
  });

  const response = NextResponse.json({
    ok: true,
    tokenType: 'Bearer',
    accessToken: token,
    expiresIn,
    account,
    sessionId: stored.sessionId,
  });

  response.cookies.set('autarkicToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: expiresIn,
  });

  return response;
}
