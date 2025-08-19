// app/api/agents/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const ALL_SET   = 'agents:all';
const BY_VENDOR = (acct) => `agents:byVendor:${acct}`;
const AGENT     = (id) => `agent:${id}`;

/* DELETE /api/agents/:id — remove one agent (vendor only) */
export async function DELETE(_request, { params }) {
  const account = (await cookies()).get('xummAccount')?.value;
  if (!account) return NextResponse.json({ error:'Not auth' }, { status:401 });

  const id  = params.id;
  const rec = await kv.hgetall(AGENT(id));
  if (!rec) return NextResponse.json({ removed: 0 });

  if (rec.vendorAccount !== account)
    return NextResponse.json({ error:'Forbidden' }, { status:403 });

  await kv.del(AGENT(id));
  await kv.zrem(BY_VENDOR(rec.vendorAccount), id);
  await kv.zrem(ALL_SET, id);

  return NextResponse.json({ removed: 1 });
}
