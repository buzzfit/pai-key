// app/api/xumm-connect-status/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid');
  if (!uuid) {
    return NextResponse.json({ signed: false, error: 'missing uuid' }, { status: 400 });
  }

  const res = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
    headers: {
      'x-api-key': process.env.XUMM_API_KEY,
      'x-api-secret': process.env.XUMM_API_SECRET,
      'accept': 'application/json',
    },
    // Ensure Vercel doesn’t cache
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ signed: false, error: 'xumm fetch failed' }, { status: 502 });
  }

  const data = await res.json();

  const signed = data?.meta?.signed === true;
  const account = data?.response?.account || null;
  const userToken = data?.response?.user_token || null;

  if (signed && account) {
    const resp = NextResponse.json({ signed: true, account, userToken });

    // Set secure HttpOnly cookies (7 days)
    const cookieOpts = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    };

    resp.cookies.set('xummAccount', account, cookieOpts);
    if (userToken) {
      resp.cookies.set('xummUserToken', userToken, cookieOpts);
    }

    return resp;
  }

  return NextResponse.json({ signed: false });
}
