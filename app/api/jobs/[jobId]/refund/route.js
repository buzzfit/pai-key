import { NextResponse } from 'next/server';
import { resolveRequestAuth, requireHuman } from '../../../../../lib/requestAuth';
import { jobsService, jsonError } from '../../_service';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const auth = await resolveRequestAuth(request);
  const authError = requireHuman(auth);
  if (authError) return jsonError(401, authError, 'Human wallet authentication is required');

  const body = await request.json().catch(() => ({}));
  const result = await jobsService.refundEscrow({
    jobId: params.jobId,
    hirerWallet: auth.account,
    reason: body?.reason,
  });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);

  const payloadUuid = result.tx?.uuid || null;
  const payloadNext = result.tx?.signUrl || null;

  return NextResponse.json({
    ok: true,
    job: result.job,
    escrowTx: result.tx,
    ...(payloadUuid ? { uuid: payloadUuid } : {}),
    ...(payloadNext ? { next: payloadNext } : {}),
  });
}
