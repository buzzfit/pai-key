// app/api/xumm-connect/route.js
import { NextResponse } from 'next/server';

// Ensure this route is always dynamic (no caching of secrets)
export const dynamic = 'force-dynamic';

export async function POST() {
  // Build the SignIn payload per Xumm docs
  // SignIn is a Xumm-specific pseudo transaction: never submitted on-ledger.
  // https://docs.xumm.dev/environments/backend-sdk-api/user-identification-payloads
  const body = { txjson: { TransactionType: 'SignIn' } };

  try {
    const res = await fetch('https://xumm.app/api/v1/platform/payload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Xumm requires backend-only headers:
        // https://docs.xumm.dev/concepts/authorization
        'x-api-key': process.env.XUMM_API_KEY || '',
        'x-api-secret': process.env.XUMM_API_SECRET || ''
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, status: res.status, error: 'XummCreateFailed', detail: text },
        { status: 500 }
      );
    }

    const data = await res.json();

    // Xumm returns a UUID + links. We forward the safe bits to the client.
    // https://xumm.readme.io/reference/post-payload
    return NextResponse.json({
      ok: true,
      uuid: data.uuid,
      signUrl: data?.next?.always ?? null, // deep link / QR page
      qrUrl: data?.refs?.qr_png ?? null    // direct QR image
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'ServerError', detail: String(err) },
      { status: 500 }
    );
  }
}
