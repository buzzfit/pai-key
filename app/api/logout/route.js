// app/api/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const ALL_SET   = 'agents:all';
const BY_VENDOR = (acct) => `agents:byVendor:${acct}`;
const AGENT     = (id) => `agent:${id}`;

export async function POST() {
  const jar = await cookies();

  // read current vendor wallet (if any)
  const vendor = jar.get('xummAccount')?.value;
  let removed = 0;

  if (vendor) {
    try {
      // get all agent ids for this vendor
      const ids = await kv.zrange(BY_VENDOR(vendor), 0, -1);
      if (ids?.length) {
        // delete each agent hash
        await Promise.all(ids.map((id) => kv.del(AGENT(id))));
        // remove from vendor index + global index
        await Promise.all(ids.map((id) => kv.zrem(BY_VENDOR(vendor), id)));
        await Promise.all(ids.map((id) => kv.zrem(ALL_SET, id)));
        // optional: drop the vendor index key entirely
        await kv.del(BY_VENDOR(vendor));
        removed = ids.length;
      }
    } catch {
      // ignore cleanup errors; continue to clear cookies
    }
  }

  // clear cookies (as your original code did)
  jar.delete('xummAccount');
  jar.delete('xummUserToken');
  jar.delete('xummToken');

  const expire = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  };

  const res = NextResponse.json({ ok: true, removed });
  res.cookies.set('xummAccount', '', expire);
  res.cookies.set('xummUserToken', '', expire);
  res.cookies.set('xummToken', '', expire);
  return res;
}
