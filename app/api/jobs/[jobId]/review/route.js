import { NextResponse } from 'next/server';
import { resolveRequestAuth, requireHuman } from '../../../../../lib/requestAuth';
import { jobsService, jsonError } from '../../_service';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const auth = await resolveRequestAuth(request);
  const authError = requireHuman(auth);
  if (authError) return jsonError(401, authError, 'Human wallet authentication is required');

  const body = await request.json().catch(() => null);
  const result = await jobsService.reviewSubmission({ jobId: params.jobId, hirerWallet: auth.account, body });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);

  if (body?.decision === 'accepted' && body?.createEscrowFinish !== false) {
    const finish = await jobsService.releaseEscrow({ jobId: params.jobId, hirerWallet: auth.account });
    if (finish.error) return jsonError(finish.status, finish.error[0], finish.error[1]);
    return NextResponse.json({ ok: true, job: finish.job, dispute: result.dispute, escrowTx: finish.tx });
  }

  return NextResponse.json({ ok: true, job: result.job, dispute: result.dispute, escrowTx: null });
}
