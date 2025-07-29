// app/api/agents/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ⚠️ Prototype-only memory store.
// Will reset on cold starts / redeploys in serverless environments.
const agentsMem = [];

/**
 * GET /api/agents
 * - Optional query: ?account=rXXXX...  filters by vendor wallet
 * - Optional query: ?type=code_gen     filters by agent type
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  const type = searchParams.get('type');

  let list = agentsMem;
  if (account) list = list.filter(a => a.vendorAccount === account);
  if (type) list = list.filter(a => a.agentType === type);

  // sort newest first for now
  list = [...list].sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ agents: list });
}

/**
 * POST /api/agents
 * Body: { agentType, name, tagline, description, capabilities[], hourlyRate, minHours, proof[], xrpAddr }
 * - Reads vendor account from secure cookie (xummAccount)
 * - Validates minimal fields
 */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });

  const jar = await cookies();
  const vendorAccount = jar.get('xummAccount')?.value;
  if (!vendorAccount) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const {
    agentType, name, tagline, description,
    capabilities = [], hourlyRate, minHours,
    proof = [], xrpAddr
  } = body;

  if (!agentType || !name || !tagline || !description || !hourlyRate || !minHours) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Minimal record
  const rec = {
    id: crypto.randomUUID(),
    vendorAccount,
    agentType,
    name,
    tagline,
    description,
    capabilities,
    hourlyRate: String(hourlyRate),
    minHours: String(minHours),
    proof,
    payoutAccount: xrpAddr || vendorAccount, // fallback
    completed_jobs: 0,
    avg_rating: 0,
    busy: false,
    createdAt: Date.now(),
  };

  agentsMem.push(rec);
  return NextResponse.json({ ok: true, agent: rec }, { status: 201 });
}
