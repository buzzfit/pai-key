import test from 'node:test';
import assert from 'node:assert/strict';
import { createJobsService } from '../lib/jobsCore.js';

function makeHarness() {
  const agents = new Map();
  const jobs = new Map();
  const disputes = new Map();

  agents.set('agent-1', {
    id: 'agent-1',
    payoutAccount: 'rAGENT1',
    vendorAccount: 'rAGENT1',
    completed_jobs: 0,
    accepted_reviews: 0,
    rejected_reviews: 0,
    disputed_reviews: 0,
    total_ratings: 0,
    ratings_count: 0,
    avg_rating: 0,
    performance_score: 0,
  });

  const store = {
    async loadAgent(agentId) {
      const rec = agents.get(agentId);
      return rec ? { origin: 'autarkic', record: rec, key: agentId } : null;
    },
    async createJob(job) { jobs.set(job.id, job); return job; },
    async updateJob(job) { jobs.set(job.id, job); return job; },
    async getJob(id) { return jobs.get(id) || null; },
    async listJobs({ hirerWallet, agentWallet, status }) {
      return [...jobs.values()]
        .filter((j) => !hirerWallet || j.hirerWallet === hirerWallet)
        .filter((j) => !agentWallet || j.agentWallet === agentWallet)
        .filter((j) => !status || j.status === status);
    },
    async saveDispute(d) { disputes.set(d.jobId, d); return d; },
    async getDispute(jobId) { return disputes.get(jobId) || null; },
    async updateAgentReputation(agentId, updater) {
      const current = agents.get(agentId);
      if (!current) return null;
      const next = updater(current);
      agents.set(agentId, next);
      return next;
    },
  };

  const escrow = {
    async createEscrow({ jobId }) { return { txHash: `create-${jobId}`, escrowSequence: `seq-${jobId}`, ledgerIndex: 1 }; },
    async finishEscrow({ jobId }) { return { txHash: `finish-${jobId}`, ledgerIndex: 2 }; },
    async cancelEscrow({ jobId }) { return { txHash: `cancel-${jobId}`, ledgerIndex: 3 }; },
  };

  return { service: createJobsService({ store, escrow }), agents };
}

test('happy path: create -> deposit -> submit -> accept -> release updates reputation', async () => {
  const { service, agents } = makeHarness();

  const created = await service.createJob({
    hirerWallet: 'rHIRER',
    body: { agentId: 'agent-1', offer: { priceXrp: '25' }, terms: 'Build feature', deadline: '2027-01-01' },
  });
  assert.equal(created.status, 201);
  const jobId = created.job.id;

  const deposit = await service.depositEscrow({ jobId, hirerWallet: 'rHIRER' });
  assert.equal(deposit.job.status, 'escrowed');

  const submission = await service.submitWork({
    jobId,
    agentWallet: 'rAGENT1',
    body: { proof: { type: 'git_commit', value: 'abc123' } },
  });
  assert.equal(submission.job.status, 'submitted');

  const review = await service.reviewSubmission({
    jobId,
    hirerWallet: 'rHIRER',
    body: { decision: 'accepted', rating: 5, comment: 'Great' },
  });
  assert.equal(review.job.status, 'accepted_pending_release');

  const release = await service.releaseEscrow({ jobId, hirerWallet: 'rHIRER' });
  assert.equal(release.job.status, 'completed');

  const rep = agents.get('agent-1');
  assert.equal(rep.completed_jobs, 1);
  assert.equal(rep.accepted_reviews, 1);
  assert.equal(rep.avg_rating, 5);
  assert.ok(rep.performance_score > 0);
});

test('rejection opens dispute and resolve refund marks refunded', async () => {
  const { service } = makeHarness();

  const created = await service.createJob({
    hirerWallet: 'rHIRER',
    body: { agentId: 'agent-1', offer: { priceXrp: '25' }, terms: 'Task' },
  });
  const jobId = created.job.id;

  await service.depositEscrow({ jobId, hirerWallet: 'rHIRER' });
  await service.submitWork({ jobId, agentWallet: 'rAGENT1', body: { proof: { ok: true } } });

  const review = await service.reviewSubmission({
    jobId,
    hirerWallet: 'rHIRER',
    body: { decision: 'rejected', comment: 'Not complete' },
  });
  assert.equal(review.job.status, 'disputed');
  assert.equal(review.dispute.status, 'open');

  const resolved = await service.resolveDispute({
    jobId,
    resolver: 'admin',
    body: { resolution: 'refund', note: 'Insufficient proof' },
  });
  assert.equal(resolved.job.status, 'refunded');
  assert.equal(resolved.dispute.status, 'resolved');
});

test('dispute can be resolved to release', async () => {
  const { service } = makeHarness();

  const created = await service.createJob({
    hirerWallet: 'rHIRER',
    body: { agentId: 'agent-1', offer: { priceXrp: '12' }, terms: 'Task' },
  });
  const jobId = created.job.id;

  await service.depositEscrow({ jobId, hirerWallet: 'rHIRER' });
  await service.submitWork({ jobId, agentWallet: 'rAGENT1', body: { proof: { link: 'ipfs://proof' } } });
  await service.openDispute({ jobId, actorWallet: 'rHIRER', reason: 'Needs admin decision' });

  const resolved = await service.resolveDispute({
    jobId,
    resolver: 'admin',
    body: { resolution: 'release', note: 'Deliverable accepted via arbitration' },
  });

  assert.equal(resolved.job.status, 'completed');
  assert.equal(resolved.dispute.status, 'resolved');
});

test('listJobs supports status filters for agent polling', async () => {
  const { service } = makeHarness();

  const created = await service.createJob({
    hirerWallet: 'rHIRER',
    body: { agentId: 'agent-1', offer: { priceXrp: '5' }, terms: 'Task' },
  });
  const jobId = created.job.id;

  await service.depositEscrow({ jobId, hirerWallet: 'rHIRER' });

  const escrowed = await service.listJobs({ status: 'escrowed' });
  assert.equal(escrowed.length, 1);
  assert.equal(escrowed[0].id, jobId);

  const submitted = await service.listJobs({ status: 'submitted' });
  assert.equal(submitted.length, 0);
});

test('authorization mismatch on submit is rejected', async () => {
  const { service } = makeHarness();

  const created = await service.createJob({
    hirerWallet: 'rHIRER',
    body: { agentId: 'agent-1', offer: { priceXrp: '5' }, terms: 'Task' },
  });
  const jobId = created.job.id;
  await service.depositEscrow({ jobId, hirerWallet: 'rHIRER' });

  const bad = await service.submitWork({
    jobId,
    agentWallet: 'rNOTAGENT',
    body: { proof: { ok: true } },
  });

  assert.equal(bad.status, 403);
  assert.equal(bad.error[0], 'Forbidden');
});
