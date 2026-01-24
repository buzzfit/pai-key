import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@vercel/kv';

export const dynamic = 'force-dynamic';

// Initialize the KV client using the PAIKEY-prefixed variables
const kv = createClient({
  url: process.env.PAIKEY_KV_REST_API_URL,
  token: process.env.PAIKEY_KV_REST_API_TOKEN,
});

const ALL_SET   = 'autarkic:all';
const BY_WALLET = (acct) => `autarkic:byWallet:${acct}`;
const AGENT     = (id) => `autarkic:${id}`;
const WALLET    = (acct) => `autarkic:wallet:${acct}`; // <— new

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
  await kv.del(WALLET(wallet));                // <— clear the 1-per-wallet claim

  return NextResponse.json({ removed: 1 });
}
