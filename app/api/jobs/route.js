import { NextResponse } from 'next/server';
import { resolveRequestAuth, requireHuman } from '../../../lib/requestAuth';
import { jobsService, jsonError } from './_service';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await resolveRequestAuth(request);
  if (!auth.account) {
    return jsonError(401, auth.error || 'NotAuthenticated', 'Authentication required');
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') || 'mine';
  const status = searchParams.get('status') || null;
  const agent = searchParams.get('agent') || null;
  const requestedAgentWallet = agent === 'self' ? auth.account : agent;

  if (requestedAgentWallet && auth.type !== 'agent') {
    return jsonError(403, 'Forbidden', 'Agent-scoped queries require agent bearer authentication');
  }

  const jobs = await jobsService.listJobs(
    requestedAgentWallet
      ? { agentWallet: requestedAgentWallet, status }
      : scope === 'all'
      ? { status }
      : auth.type === 'human'
        ? { hirerWallet: auth.account, status }
        : { agentWallet: auth.account, status }
  );

  return NextResponse.json({ ok: true, jobs });
}

export async function POST(request) {
  const auth = await resolveRequestAuth(request);
  const authError = requireHuman(auth);
  if (authError) return jsonError(401, authError, 'Human wallet authentication is required');

  const body = await request.json().catch(() => null);
  const result = await jobsService.createJob({ hirerWallet: auth.account, body });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);
  return NextResponse.json({ ok: true, job: result.job }, { status: 201 });
}
