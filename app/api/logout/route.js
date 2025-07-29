// app/api/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ensure the handler is always executed server‑side (no static cache)
export const dynamic = 'force-dynamic';

export async function POST() {
  const jar = await cookies();

  // delete by name
  jar.delete('xummAccount');
  jar.delete('xummUserToken');
  jar.delete('xummToken');

  // also overwrite with expired Set‑Cookie (extra safety)
  const expire = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  };

  const res = NextResponse.json({ ok: true });
  res.cookies.set('xummAccount', '', expire);
  res.cookies.set('xummUserToken', '', expire);
  res.cookies.set('xummToken', '', expire);
  return res;
}
