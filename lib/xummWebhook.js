import crypto from 'crypto';

export function verifyXummWebhookSignature(rawBody, signature) {
  const secret = process.env.XUMM_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const normalized = String(signature).trim().toLowerCase();
  if (normalized.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(normalized), Buffer.from(expected));
}

export function parseXummCallbackPayload(body) {
  const payloadUuid = body?.payload_uuidv4 || body?.uuid || null;
  const signed = body?.signed === true || body?.meta?.signed === true;
  const txid = body?.txid || body?.response?.txid || null;
  return { payloadUuid, signed, txid };
}
