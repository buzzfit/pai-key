// app/api/agents/route.js
import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import store            from './_store';

export const dynamic = 'force-dynamic';   // never cache

/* ─────────────── GET /api/agents ───────────────
   Optional query params:
     ?account=rX...   → that vendor’s agents only
     ?type=code_gen   → filter by agent type
*/
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  const type    = searchParams.get('type');

  let list = store();
  if (account) list = list.filter(a => a.vendorAccount === account);
  if (type)    list = list.filter(a => a.agentType      === type);

  list = [...list].sort((a, b) => b.createdAt - a.createdAt);   // newest first
  return NextResponse.json({ agents: list });
}

/* ─────────────── POST /api/agents ───────────────
   Body: {
     agentType, name, tagline, description, capabilities[],
     hourlyRate, minHours, proof[], xrpAddr
   }
   Requires xummAccount cookie (vendor auth)
*/
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });

  const vendorAccount = cookies().get('xummAccount')?.value;
  if (!vendorAccount) return NextResponse.json({ error:'Not authenticated' }, { status:401 });

  const {
    agentType, name, tagline, description,
    capabilities = [], hourlyRate, minHours,
    proof = [], xrpAddr
  } = body;

  if (!agentType || !name || !tagline || !description || !hourlyRate || !minHours)
    return NextResponse.json({ error:'Missing fields' }, { status:400 });

  const rec = {
    id:             crypto.randomUUID(),
    vendorAccount,
    agentType, name, tagline, description,
    capabilities,
    hourlyRate:     String(hourlyRate),
    minHours:       String(minHours),
    proof,
    payoutAccount:  xrpAddr || vendorAccount,
    completed_jobs: 0,
    avg_rating:     0,
    busy:           false,
    createdAt:      Date.now(),
  };

  store().push(rec);
  return NextResponse.json({ ok:true, agent:rec }, { status:201 });
}
