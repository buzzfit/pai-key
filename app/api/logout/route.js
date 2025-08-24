// app/api/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Cookie-only logout. No KV writes. No undock side-effects.
export async function POST() {
  const jar = cookies();
  const expire = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  };

  // Clear known session cookies
  for (const name of ['xummAccount', 'xummUserToken', 'xummToken']) {
    try { jar.delete(name); } catch {}
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('xummAccount', '', expire);
  res.cookies.set('xummUserToken', '', expire);
  res.cookies.set('xummToken', '', expire);
  return res;
}
