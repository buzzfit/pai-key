// app/api/agents/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic'; // don't cache this handler

// Keys
const ALL_SET   = 'agents:all';                          // zset of all agent IDs
const BY_VENDOR = (acct) => `agents:byVendor:${acct}`;   // zset of agent IDs for a vendor
const AGENT     = (id) => `agent:${id}`;                 // hash per agent

/* ─────────────── GET /api/agents ───────────────
   Optional:
     ?account=rX...   → filter by vendor
     ?type=code_gen   → filter by agent type
*/
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  const type    = searchParams.get('type');

  // newest first (score = createdAt)
  const ids = account
    ? await kv.zrange(BY_VENDOR(account), 0, -1, { rev: true })
    : await kv.zrange(ALL_SET, 0, -1, { rev: true });

  if (!ids?.length) return NextResponse.json({ agents: [] });

  const agents = (await Promise.all(ids.map((id) => kv.hgetall(AGENT(id)))))
    .filter(Boolean)
    .filter(a => !type || a.agentType === type);

  return NextResponse.json({ agents });
}

/* ─────────────── POST /api/agents ───────────────
   Body: {
     agentType, name, tagline, description, capabilities[]|string,
     hourlyRate, minHours, proof[], xrpAddr
   }
   Requires xummAccount cookie (vendor auth)
*/
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });

  const jar = await cookies(); // next/headers cookies() (route handlers) is async. :contentReference[oaicite:1]{index=1}
  const vendorAccount = jar.get('xummAccount')?.value;
  if (!vendorAccount) return NextResponse.json({ error:'Not authenticated' }, { status:401 });

  const {
    agentType, name, tagline, description,
    capabilities = [], hourlyRate, minHours,
    proof = [], xrpAddr
  } = body;

  if (!agentType || !name || !tagline || !description || !hourlyRate || !minHours)
    return NextResponse.json({ error:'Missing fields' }, { status:400 });

  // normalize capabilities → array
  const caps = Array.isArray(capabilities)
    ? capabilities
    : String(capabilities).split(',').map(s => s.trim()).filter(Boolean);

  const createdAt = Date.now();
  const id = crypto.randomUUID();
  const rec = {
    id,
    vendorAccount,
    agentType, name, tagline, description,
    capabilities: caps,
    hourlyRate: String(hourlyRate),
    minHours: String(minHours),
    proof,
    payoutAccount: xrpAddr || vendorAccount,
    completed_jobs: 0,
    avg_rating: 0,
    busy: false,
    createdAt,
  };

  // persist: one hash + two zset indexes (ordered by createdAt)
  await kv.hset(AGENT(id), rec);
  await kv.zadd(BY_VENDOR(vendorAccount), { score: createdAt, member: id });
  await kv.zadd(ALL_SET, { score: createdAt, member: id });

  return NextResponse.json({ ok:true, agent:rec }, { status:201 });
}
