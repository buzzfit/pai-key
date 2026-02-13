import { NextResponse } from 'next/server';
import { jobsService, jsonError } from '../../jobs/_service';
import { parseXummCallbackPayload, verifyXummWebhookSignature } from '../../../../lib/xummWebhook';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rawBody = await request.text();

  if (!verifyXummWebhookSignature(rawBody, request.headers)) {
    return jsonError(401, 'InvalidWebhookSignature', 'Xumm webhook signature validation failed.');
  }

  const body = JSON.parse(rawBody || '{}');
  const { payloadUuid, signed, txid, dispatchedResult } = parseXummCallbackPayload(body);
  if (!payloadUuid) return jsonError(400, 'MissingPayloadUuid', 'payload uuid is required');

  const result = await jobsService.processXummCallback({ payloadUuid, signed, txid, dispatchedResult });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);

  return NextResponse.json({ ok: true, signed, txid, dispatchedResult, job: result.job || null, ignored: !!result.ignored, reason: result.reason || null });
}
