// lib/xummConnectClient.js
// Simple browser-side helper to create a Xumm SignIn payload,
// open the deep link / QR, and poll until the user signs.
// Cookies are set by our /api/xumm-connect-status route on success.

export async function connectXummInteractive(
  { intervalMs = 3000, timeoutMs = 120000 } = {}
) {
  // 1) Ask our server to create a SignIn payload
  const make = await fetch('/api/xumm-connect', { method: 'POST' }).then(r => r.json());
  if (!make?.uuid || !make?.signUrl) {
    throw new Error('Failed to create Xumm payload');
  }

  // 2) Open the Xumm universal link.
  // On desktop this shows a QR; on mobile it deep-links the app.
  // Docs call this the "next.always" URL.
  // https://xumm.readme.io/reference/post-payload
  // https://docs.xumm.dev/js-ts-sdk/sdk-syntax/xumm.payload/create
  window.open(make.signUrl, '_blank', 'noopener,noreferrer');

  // 3) Poll status until signed or timeout
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await new Promise(r => setTimeout(r, intervalMs));
    const status = await fetch(`/api/xumm-connect-status?uuid=${make.uuid}`).then(r => r.json());
    if (status?.signed && status?.account) {
      // Our status route sets HttpOnly cookies; just return the address for UI.
      return status.account;
    }
  }
  throw new Error('Xumm connect timed out');
}
