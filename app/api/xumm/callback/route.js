import { NextResponse } from 'next/server';
import { jobsService, jsonError } from '../../jobs/_service';
import { parseXummCallbackPayload, verifyXummWebhookSignature } from '../../../../lib/xummWebhook';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-xumm-signature') || request.headers.get('x-signature');
  if (!verifyXummWebhookSignature(rawBody, signature)) {
    return jsonError(401, 'InvalidWebhookSignature', 'Xumm webhook signature validation failed.');
  }

  const body = JSON.parse(rawBody || '{}');
  const { payloadUuid, signed, txid } = parseXummCallbackPayload(body);
  if (!payloadUuid) return jsonError(400, 'MissingPayloadUuid', 'payload uuid is required');

  const result = await jobsService.processXummCallback({ payloadUuid, signed, txid });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);
  return NextResponse.json({ ok: true, signed, txid, job: result.job || null, ignored: !!result.ignored });
}
