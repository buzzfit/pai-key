import { createJobsService } from '../../../lib/jobsCore';
import { jobsStore } from '../../../lib/jobsKvStore';
import * as escrow from '../../../lib/xrplEscrow';

export const jobsService = createJobsService({ store: jobsStore, escrow });

export function jsonError(status, code, message) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}
