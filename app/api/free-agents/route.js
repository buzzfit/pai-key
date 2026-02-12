import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@vercel/kv';
import { verifyAgentToken } from '../../../lib/autarkicAuth';

export const dynamic = 'force-dynamic';

// Initialize the KV client using the PAIKEY-prefixed variables
const kv = createClient({
  url: process.env.PAIKEY_KV_REST_API_URL,
  token: process.env.PAIKEY_KV_REST_API_TOKEN,
});

const ALL_SET   = 'autarkic:all';                        // zset of all autarkic agent IDs
const BY_WALLET = (acct) => `autarkic:byWallet:${acct}`; // zset of IDs per wallet (we enforce max 1)
const AGENT     = (id) => `autarkic:${id}`;              // hash per agent
const WALLET    = (acct) => `autarkic:wallet:${acct}`;   // single-claim key per wallet

function apiError(status, code, message, hint) {
  return NextResponse.json({ ok: false, error: { code, message, hint } }, { status });
}

async function resolveAuthenticatedWallet(request) {
  const authorization = request.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7).trim();
    const claims = verifyAgentToken(token);
    const account = claims?.account || claims?.sub || null;

    if (!account) {
      return {
        error: apiError(
          401,
          'InvalidAutarkicToken',
          'Authorization bearer token is invalid or expired.',
          'Obtain a fresh token via /api/autarkic/challenge and /api/autarkic/login, then retry with Authorization: Bearer <token>.'
        ),
      };
    }

    return { wallet: account, authMethod: 'bearer' };
  }

  const jar = await cookies();
  const cookieWallet = jar.get('xummAccount')?.value;
  if (cookieWallet) {
    return { wallet: cookieWallet, authMethod: 'cookie' };
  }

  return {
    error: apiError(
      401,
      'NotAuthenticated',
      'No authentication provided.',
      'Send Authorization: Bearer <autarkic token> for headless agents, or include xummAccount cookie for browser flow.'
    ),
  };
}

/** GET /api/free-agents
 *  Optional:
 *    ?account=rXXXX...   → that wallet’s agent(s) (expect 0..1)
 *    ?type=code_gen      → filter by agentType
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  const type    = searchParams.get('type');

  const ids = account
    ? await kv.zrange(BY_WALLET(account), 0, -1, { rev: true })
    : await kv.zrange(ALL_SET, 0, -1, { rev: true });

  if (!ids?.length) return NextResponse.json({ agents: [] });

  const agents = (await Promise.all(ids.map((id) => kv.hgetall(AGENT(id)))))
    .filter(Boolean)
    .filter(a => !type || a.agentType === type);

  return NextResponse.json({ agents });
}

/** POST /api/free-agents
 *  Body: { agentType, name, tagline, description, capabilities[]|string, hourlyRate, proof[], xrpAddr }
 *  Requires either Authorization: Bearer <autarkic token> or xummAccount cookie.
 *  Enforces **one agent per wallet** (409 if exists).
 */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return apiError(400, 'BadJson', 'Request body must be valid JSON.', 'Send application/json payload with agent profile fields.');
  }

  const auth = await resolveAuthenticatedWallet(request);
  if (auth.error) return auth.error;
  const wallet = auth.wallet;

  const {
    agentType, name, tagline, description,
    capabilities = [], hourlyRate = '0', proof = [], xrpAddr
  } = body;

  if (!agentType || !name || !tagline || !description) {
    return apiError(
      400,
      'MissingFields',
      'Missing required fields: agentType, name, tagline, description.',
      'Provide all required string fields before docking the autarkic agent.'
    );
  }

  // Soft check (fast path)
  const existingIds = await kv.zrange(BY_WALLET(wallet), 0, -1);
  if (existingIds?.length) {
    return apiError(
      409,
      'WalletAlreadyDocked',
      'Wallet already has an autarkic agent.',
      'Undock the existing agent before docking a new one.'
    );
  }

  // Hard guard: atomic single-claim per wallet (prevents race/double-submit)
  const createdAt = Date.now();
  const id = crypto.randomUUID();
  const claimed = await kv.set(WALLET(wallet), id, { nx: true }); // set only if not exists
  if (!claimed) {
    return apiError(
      409,
      'WalletAlreadyDocked',
      'Wallet already has an autarkic agent.',
      'A concurrent request already claimed this wallet. Undock first or retry with a different wallet.'
    );
  }

  const caps = Array.isArray(capabilities)
    ? capabilities
    : String(capabilities).split(',').map(s => s.trim()).filter(Boolean);

  const rec = {
    id,
    vendorAccount: wallet, // keep same field name used by AgentCard
    agentType, name, tagline, description,
    capabilities: caps,
    hourlyRate: String(hourlyRate || '0'),
    minHours: '1',
    proof,
    payoutAccount: xrpAddr || wallet,
    completed_jobs: 0,
    accepted_reviews: 0,
    rejected_reviews: 0,
    disputed_reviews: 0,
    total_ratings: 0,
    ratings_count: 0,
    avg_rating: 0,
    performance_score: 0,
    busy: false,
    createdAt,
  };

  try {
    await kv.hset(AGENT(id), rec);
    await kv.zadd(BY_WALLET(wallet), { score: createdAt, member: id });
    await kv.zadd(ALL_SET, { score: createdAt, member: id });
    return NextResponse.json({ ok: true, agent: rec }, { status: 201 });
  } catch (e) {
    // Roll back the claim and any partial record on error
    await Promise.allSettled([
      kv.del(WALLET(wallet)),
      kv.del(AGENT(id)),
      kv.zrem(BY_WALLET(wallet), id),
      kv.zrem(ALL_SET, id),
    ]);
    throw e;
  }
}
