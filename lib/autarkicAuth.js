import { createClient } from '@vercel/kv';
import { createHmac, createPublicKey, randomBytes, timingSafeEqual, verify } from 'crypto';

const CHALLENGE_TTL_SECONDS = Number(process.env.AUTARKIC_CHALLENGE_TTL_SECONDS || 120);
const TOKEN_TTL_SECONDS = Number(process.env.AUTARKIC_TOKEN_TTL_SECONDS || 60 * 60);

const kv = createClient({
  url: process.env.PAIKEY_KV_REST_API_URL,
  token: process.env.PAIKEY_KV_REST_API_TOKEN,
});

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function decodeBase64url(input) {
  const normalized = String(input || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const base64 = padding ? normalized.padEnd(normalized.length + (4 - padding), '=') : normalized;
  return Buffer.from(base64, 'base64').toString('utf8');
}

function normalizeHex(hex) {
  return String(hex || '').replace(/^0x/i, '').trim();
}

function ed25519KeyFromXrpl(publicKeyHex) {
  const raw = Buffer.from(publicKeyHex.slice(2), 'hex'); // XRPL ED keys are ED + 32 bytes
  if (raw.length !== 32) {
    throw new Error('InvalidEd25519PublicKey');
  }

  // SPKI for Ed25519 public key (RFC 8410)
  const prefix = Buffer.from('302a300506032b6570032100', 'hex');
  return createPublicKey({ key: Buffer.concat([prefix, raw]), format: 'der', type: 'spki' });
}

function secp256k1KeyFromXrpl(publicKeyHex) {
  const raw = Buffer.from(publicKeyHex, 'hex');
  if (raw.length !== 33) {
    throw new Error('InvalidSecp256k1PublicKey');
  }

  // SPKI for secp256k1 compressed point.
  const prefix = Buffer.from('3036301006072a8648ce3d020106052b8104000a032200', 'hex');
  return createPublicKey({ key: Buffer.concat([prefix, raw]), format: 'der', type: 'spki' });
}

export function createNonce() {
  return randomBytes(24).toString('hex');
}

export function createSessionId() {
  return randomBytes(16).toString('hex');
}

export async function storeChallenge({ challenge, account = null, sessionId }) {
  const expiresAt = Date.now() + CHALLENGE_TTL_SECONDS * 1000;
  const key = `autarkic:challenge:${challenge}`;

  await kv.set(
    key,
    {
      challenge,
      account,
      sessionId,
      consumed: false,
      expiresAt,
    },
    { ex: CHALLENGE_TTL_SECONDS }
  );

  return { expiresAt, ttlSeconds: CHALLENGE_TTL_SECONDS };
}

export async function loadChallenge(challenge) {
  return kv.get(`autarkic:challenge:${challenge}`);
}

export async function consumeChallenge(challenge, existing) {
  const key = `autarkic:challenge:${challenge}`;
  const remainingSeconds = Math.max(1, Math.ceil((existing.expiresAt - Date.now()) / 1000));

  await kv.set(
    key,
    {
      ...existing,
      consumed: true,
      consumedAt: Date.now(),
    },
    { ex: remainingSeconds }
  );
}

export function verifyXrplSignature({ publicKey, challenge, signature }) {
  const normalizedPublicKey = normalizeHex(publicKey).toUpperCase();
  const normalizedSignature = normalizeHex(signature);

  if (!normalizedPublicKey || !normalizedSignature) {
    return false;
  }

  const message = Buffer.from(challenge, 'utf8');
  const sigBytes = Buffer.from(normalizedSignature, 'hex');

  try {
    if (normalizedPublicKey.startsWith('ED')) {
      const key = ed25519KeyFromXrpl(normalizedPublicKey);
      return verify(null, message, key, sigBytes);
    }

    const key = secp256k1KeyFromXrpl(normalizedPublicKey);
    return verify('sha256', message, key, sigBytes);
  } catch {
    return false;
  }
}

export function issueAgentToken({ account, sessionId, publicKey }) {
  const secret = process.env.AUTARKIC_JWT_SECRET;
  if (!secret) {
    throw new Error('Missing AUTARKIC_JWT_SECRET');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: account,
    account,
    sessionId,
    publicKey,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const jwtSig = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return {
    token: `${signingInput}.${jwtSig}`,
    expiresIn: TOKEN_TTL_SECONDS,
  };
}

export function verifyAgentToken(token) {
  const secret = process.env.AUTARKIC_JWT_SECRET;
  if (!secret) {
    throw new Error('Missing AUTARKIC_JWT_SECRET');
  }

  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, sig] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const header = JSON.parse(decodeBase64url(encodedHeader));
    const payload = JSON.parse(decodeBase64url(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;
    if (typeof payload.exp !== 'number' || payload.exp <= now) return null;

    return payload;
  } catch {
    return null;
  }
}
