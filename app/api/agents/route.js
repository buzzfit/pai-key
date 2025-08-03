// app/api/agents/route.js
import { NextResponse } from 'next/server';
import { cookies }       from 'next/headers';

export const dynamic = 'force-dynamic';   // never cache — always run on server

// ⚠️ in-memory store (gone on cold start) — fine until we move to Prisma
let AGENTS = [];

/*────────────────────────── GET /api/agents ──────────────────────────
   Optional query params:
     ?account=rX...      → only that vendor’s agents
     ?type=code_gen      → only that agent type
*/
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  const type    = searchParams.get('type');

  let list = AGENTS;
  if (account) list = list.filter(a => a.vendorAccount === account);
  if (type)    list = list.filter(a => a.agentType      === type);

  // newest first
  list = [...list].sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ agents: list });
}

/*────────────────────────── POST /api/agents ─────────────────────────
   Body: {
     agentType, name, tagline, description, capabilities[],
     hourlyRate, minHours, proof[], xrpAddr
   }
   * Requires vendor authenticated via xummAccount cookie *
*/
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });

  const jar           = cookies();
  const vendorAccount = jar.get('xummAccount')?.value;
  if (!vendorAccount)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const {
    agentType, name, tagline, description,
    capabilities = [], hourlyRate, minHours,
    proof = [], xrpAddr
  } = body;

  if (!agentType || !name || !tagline || !description || !hourlyRate || !minHours)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const rec = {
    id:           crypto.randomUUID(),
    vendorAccount,
    agentType, name, tagline, description,
    capabilities,
    hourlyRate:   String(hourlyRate),
    minHours:     String(minHours),
    proof,
    payoutAccount: xrpAddr || vendorAccount,   // fallback to vendor wallet
    completed_jobs: 0,
    avg_rating:     0,
    busy:           false,
    createdAt:      Date.now(),
  };

  AGENTS.push(rec);
  return NextResponse.json({ ok: true, agent: rec }, { status: 201 });
}

/*──────────────────────── DELETE /api/agents/:id ─────────────────────
   Called from VendorDock “Delete” button (soon).
*/
export async function DELETE(request) {
  const id = request.nextUrl.pathname.split('/').pop();
  AGENTS   = AGENTS.filter(a => a.id !== id);
  return NextResponse.json({ ok: true });
}
