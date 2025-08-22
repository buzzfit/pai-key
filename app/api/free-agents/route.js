// app/api/free-agents/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const ALL_SET   = 'autarkic:all';                        // zset of all autarkic agent IDs
const BY_WALLET = (acct) => `autarkic:byWallet:${acct}`; // zset of IDs per wallet (we enforce max 1)
const AGENT     = (id) => `autarkic:${id}`;              // hash per agent

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
 *  Requires wallet cookie (xummAccount). Enforces **one agent per wallet** (409 if exists).
 */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });

  const jar = await cookies();
  const wallet = jar.get('xummAccount')?.value;
  if (!wallet) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const {
    agentType, name, tagline, description,
    capabilities = [], hourlyRate = '0', proof = [], xrpAddr
  } = body;

  if (!agentType || !name || !tagline || !description)
    return NextResponse.json({ error:'Missing fields' }, { status:400 });

  // Enforce single agent per wallet
  const existingIds = await kv.zrange(BY_WALLET(wallet), 0, -1);
  if (existingIds?.length) {
    return NextResponse.json({ error: 'Wallet already has an autarkic agent.' }, { status: 409 });
  }

  const caps = Array.isArray(capabilities)
    ? capabilities
    : String(capabilities).split(',').map(s => s.trim()).filter(Boolean);

  const createdAt = Date.now();
  const id = crypto.randomUUID();
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
    avg_rating: 0,
    busy: false,
    createdAt,
  };

  await kv.hset(AGENT(id), rec);
  await kv.zadd(BY_WALLET(wallet), { score: createdAt, member: id });
  await kv.zadd(ALL_SET, { score: createdAt, member: id });

  return NextResponse.json({ ok:true, agent:rec }, { status:201 });
}
