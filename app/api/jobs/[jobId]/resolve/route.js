import { NextResponse } from 'next/server';
import { jobsService, jsonError } from '../../_service';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const adminSecret = process.env.DISPUTE_ADMIN_SECRET;
  const provided = request.headers.get('x-dispute-admin-secret');
  if (!adminSecret || provided !== adminSecret) {
    return jsonError(401, 'AdminSecretRequired', 'A valid dispute admin secret is required.');
  }

  const body = await request.json().catch(() => null);
  const result = await jobsService.resolveDispute({
    jobId: params.jobId,
    resolver: 'admin',
    body,
  });
  if (result.error) return jsonError(result.status, result.error[0], result.error[1]);

  return NextResponse.json({ ok: true, job: result.job, dispute: result.dispute, escrowTx: result.tx });
}
