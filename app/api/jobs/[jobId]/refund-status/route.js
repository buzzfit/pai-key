import { NextResponse } from 'next/server';
import { resolveRequestAuth, requireHuman } from '../../../../../lib/requestAuth';
import { jobsService, jsonError } from '../../_service';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await resolveRequestAuth(request);
  const authError = requireHuman(auth);
  if (authError) return jsonError(401, authError, 'Human wallet authentication is required');

  const result = await jobsService.confirmEscrowRefund({ jobId: params.jobId, hirerWallet: auth.account });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);
  return NextResponse.json({ ok: true, job: result.job, refundStatus: result.payload });
}
