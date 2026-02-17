import { NextResponse } from 'next/server';
import { resolveRequestAuth, requireAgent } from '../../../../../lib/requestAuth';
import { jobsService, jsonError } from '../../_service';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const auth = await resolveRequestAuth(request);
  const authError = requireAgent(auth);
  if (authError) return jsonError(401, authError, 'Agent wallet authentication is required');

  const body = await request.json().catch(() => ({}));
  const result = await jobsService.submitProof({ jobId: params.jobId, agentWallet: auth.account, body });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);
  return NextResponse.json({ ok: true, job: result.job });
}
