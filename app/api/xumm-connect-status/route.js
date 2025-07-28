// app/api/xumm-connect-status/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid');
  if (!uuid) {
    return NextResponse.json({ signed: false, error: 'missing uuid' }, { status: 400 });
  }

  const res = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
    headers: {
      'x-api-key': process.env.XUMM_API_KEY || '',
      'x-api-secret': process.env.XUMM_API_SECRET || '',
      'accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { signed: false, error: 'XummStatusFailed', status: res.status, detail },
      { status: 502 }
    );
  }

  const data = await res.json();
  const signed    = data?.meta?.signed === true;
  const account   = data?.response?.account || null;
  const userToken = data?.response?.user_token || null;

  if (!signed || !account) {
    return NextResponse.json({ signed: false });
  }

  // Build response JSON
  const resp = NextResponse.json({ signed: true, account, userToken });

  // Secure, HttpOnly cookies so JS can’t read them (server can).
  const opts = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
  resp.cookies.set('xummAccount', account, opts);
  if (userToken) resp.cookies.set('xummUserToken', userToken, opts);

  return resp;
}
