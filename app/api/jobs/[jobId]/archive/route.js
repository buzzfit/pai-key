import { NextResponse } from 'next/server';
import { resolveRequestAuth } from '../../../../../lib/requestAuth';
import { jobsService, jsonError } from '../../_service';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const auth = await resolveRequestAuth(request);
  if (!auth.account) return jsonError(401, auth.error || 'NotAuthenticated', 'Authentication required');

  const result = await jobsService.archiveJob({ jobId: params.jobId, actorWallet: auth.account });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);
  return NextResponse.json({ ok: true, job: result.job });
}
