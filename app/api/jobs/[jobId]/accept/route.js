import { NextResponse } from 'next/server';
import { resolveRequestAuth, requireAgent } from '../../../../../lib/requestAuth';
import { jobsService, jsonError } from '../../_service';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const auth = await resolveRequestAuth(request);
  const authError = requireAgent(auth);
  if (authError) return jsonError(401, authError, 'Agent bearer authentication is required');

  const result = await jobsService.acceptJob({ jobId: params.jobId, agentWallet: auth.account });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);
  return NextResponse.json({ ok: true, job: result.job });
}
