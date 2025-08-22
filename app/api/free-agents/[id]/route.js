// app/api/free-agents/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const ALL_SET   = 'autarkic:all';
const BY_WALLET = (acct) => `autarkic:byWallet:${acct}`;
const AGENT     = (id) => `autarkic:${id}`;

export async function DELETE(_req, { params }) {
  const jar = await cookies();
  const wallet = jar.get('xummAccount')?.value;
  if (!wallet) return NextResponse.json({ error:'Not authenticated' }, { status:401 });

  const id  = params.id;
  const rec = await kv.hgetall(AGENT(id));
  if (!rec) return NextResponse.json({ removed: 0 });

  if (rec.vendorAccount !== wallet)
    return NextResponse.json({ error:'Forbidden' }, { status:403 });

  await kv.del(AGENT(id));
  await kv.zrem(BY_WALLET(wallet), id);
  await kv.zrem(ALL_SET, id);

  return NextResponse.json({ removed: 1 });
}
