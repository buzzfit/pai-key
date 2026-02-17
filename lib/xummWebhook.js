import crypto from 'crypto';

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function normalizeSignature(value) {
  if (!value) return '';
  return String(value).trim().toLowerCase().replace(/^sha256=/, '');
}

export function verifyXummWebhookSignature(rawBody, headers) {
  const hmacSecret = process.env.XUMM_WEBHOOK_SECRET || process.env.XUMM_API_SECRET || null;
  const provided = headers.get('x-xumm-signature') || headers.get('x-signature') || headers.get('x-hook-signature') || null;

  if (hmacSecret) {
    if (!provided) return false;
    const expected = crypto.createHmac('sha256', hmacSecret).update(rawBody).digest('hex').toLowerCase();
    return safeEqual(expected, normalizeSignature(provided));
  }

  const keyHeader = headers.get('x-api-key') || headers.get('x-xumm-api-key') || null;
  if (process.env.XUMM_API_KEY) {
    if (!keyHeader) return false;
    return safeEqual(process.env.XUMM_API_KEY, String(keyHeader));
  }

  // Fallback for environments where webhook auth headers are not configured yet.
  return true;
}

export function parseXummCallbackPayload(body) {
  const payloadUuid = body?.payload_uuidv4 || body?.uuid || body?.meta?.uuid || null;
  const signed = body?.signed === true || body?.meta?.signed === true;
  const dispatchedResult = body?.payloadResponse?.dispatched_result || body?.response?.dispatched_result || null;
  const txid = body?.txid || body?.payloadResponse?.txid || body?.response?.txid || body?.custom_meta?.txid || null;
  return { payloadUuid, signed, txid, dispatchedResult };
}
