// app/api/xumm-connect-status/route.js
import { NextResponse } from 'next/server';

// No caching: we want live status
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid');

  if (!uuid) {
    return NextResponse.json({ signed: false, error: 'Missing uuid' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
      headers: {
        'x-api-key': process.env.XUMM_API_KEY || '',
        'x-api-secret': process.env.XUMM_API_SECRET || ''
      }
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { signed: false, error: 'XummStatusFailed', status: res.status, detail: text },
        { status: 500 }
      );
    }

    const data = await res.json();

    // Xumm marks completion with meta.signed === true
    // And exposes r-address & user_token in response.*
    // Docs: payload GET & SignIn pseudo type.
    // https://xumm.readme.io/reference/get-payload
    // https://docs.xumm.dev/environments/backend-sdk-api/user-identification-payloads
    const signed = data?.meta?.signed === true;

    if (!signed) {
      return NextResponse.json({ signed: false });
    }

    return NextResponse.json({
      signed: true,
      account: data?.response?.account ?? null,
      userToken: data?.response?.user_token ?? null
    });
  } catch (err) {
    return NextResponse.json(
      { signed: false, error: 'ServerError', detail: String(err) },
      { status: 500 }
    );
  }
}
