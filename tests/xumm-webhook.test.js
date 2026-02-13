import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { parseXummCallbackPayload, verifyXummWebhookSignature } from '../lib/xummWebhook.js';

function makeHeaders(obj) {
  return { get: (name) => obj[name.toLowerCase()] || null };
}

test('verifyXummWebhookSignature validates hmac header', () => {
  process.env.XUMM_API_SECRET = 'sec';
  const body = JSON.stringify({ hello: 'world' });
  const sig = crypto.createHmac('sha256', 'sec').update(body).digest('hex');
  const ok = verifyXummWebhookSignature(body, makeHeaders({ 'x-xumm-signature': sig }));
  assert.equal(ok, true);
});

test('parseXummCallbackPayload extracts txid and uuid', () => {
  const payload = parseXummCallbackPayload({
    payload_uuidv4: 'uuid-1',
    signed: true,
    payloadResponse: { txid: 'ABC', dispatched_result: 'tesSUCCESS' },
  });
  assert.equal(payload.payloadUuid, 'uuid-1');
  assert.equal(payload.signed, true);
  assert.equal(payload.txid, 'ABC');
});
