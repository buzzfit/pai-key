import test from 'node:test';
import assert from 'node:assert/strict';
import { createJobsService } from '../lib/jobsCore.js';

function makeHarness({ asyncSign = false, payloadSigned = true } = {}) {
  const agents = new Map();
  const jobs = new Map();
  const disputes = new Map();
  const payloadMap = new Map();

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
    busy: false,
  });

  const store = {
    async loadAgent(agentId) { const rec = agents.get(agentId); return rec ? { origin: 'autarkic', record: rec, key: agentId } : null; },
    async createJob(job) { jobs.set(job.id, job); return job; },
    async updateJob(job) { jobs.set(job.id, job); return job; },
    async getJob(id) { return jobs.get(id) || null; },
    async listJobs({ hirerWallet, agentWallet, status, includeArchived = false } = {}) {
      return [...jobs.values()]
        .filter((j) => includeArchived || j.status !== 'archived')
        .filter((j) => !hirerWallet || j.hirerWallet === hirerWallet)
        .filter((j) => !agentWallet || j.agentWallet === agentWallet)
        .filter((j) => !status || j.status === status);
    },
    async saveDispute(d) { disputes.set(d.jobId, d); return d; },
    async getDispute(jobId) { return disputes.get(jobId) || null; },
    async updateAgentReputation(agentId, updater) { const current = agents.get(agentId); const next = updater(current); agents.set(agentId, next); return next; },
    async indexPayloadUuid(uuid, jobId) { payloadMap.set(uuid, jobId); },
    async getJobIdByPayloadUuid(uuid) { return payloadMap.get(uuid) || null; },
  };

  const escrow = {
    async createEscrow({ jobId }) {
      if (asyncSign) return { action: 'signature_required', uuid: `create-${jobId}`, signUrl: 'https://xumm/sign/create' };
      return { txHash: `create-${jobId}`, escrowSequence: `seq-${jobId}`, ledgerIndex: 1 };
    },
    async finishEscrow({ jobId }) {
      if (asyncSign) return { action: 'signature_required', uuid: `finish-${jobId}`, signUrl: 'https://xumm/sign/finish' };
      return { txHash: `finish-${jobId}`, ledgerIndex: 2 };
    },
    async cancelEscrow({ jobId }) { return { txHash: `cancel-${jobId}`, ledgerIndex: 3 }; },
    async getPayloadStatus(uuid) {
      if (!payloadSigned) return { meta: { signed: false, resolved: false }, response: {} };
      return { meta: { signed: true, resolved: true }, response: { txid: `tx-${uuid}` } };
    },
    async lookupTransaction(txid) {
      if (txid.includes('create-')) return { hash: txid, validated: true, meta: { TransactionResult: 'tesSUCCESS' }, tx_json: { Sequence: 77 }, ledger_index: 10 };
      return { hash: txid, validated: true, meta: { TransactionResult: 'tesSUCCESS' }, tx_json: {}, ledger_index: 11 };
    },
  };

  return { service: createJobsService({ store, escrow }), agents };
}

test('accept endpoint transition and busy flag', async () => {
  const { service, agents } = makeHarness();
  const created = await service.createJob({ hirerWallet: 'rHIRER', body: { agentId: 'agent-1', offer: { priceXrp: '10' }, terms: 'Task' } });
  await service.depositEscrow({ jobId: created.job.id, hirerWallet: 'rHIRER' });

  const accepted = await service.acceptJob({ jobId: created.job.id, agentWallet: 'rAGENT1' });
  assert.equal(accepted.job.status, 'accepted_by_agent');
  assert.equal(agents.get('agent-1').busy, true);
});

test('state machine rejects invalid transitions', async () => {
  const { service } = makeHarness();
  const created = await service.createJob({ hirerWallet: 'rHIRER', body: { agentId: 'agent-1', offer: { priceXrp: '10' }, terms: 'Task' } });
  const submitBeforeAccept = await service.submitWork({ jobId: created.job.id, agentWallet: 'rAGENT1', body: { proof: { ok: true } } });
  assert.equal(submitBeforeAccept.error[0], 'InvalidState');
});

test('escrow confirmation supports tx hash polling fallback', async () => {
  const { service } = makeHarness({ asyncSign: true });
  const created = await service.createJob({ hirerWallet: 'rHIRER', body: { agentId: 'agent-1', offer: { priceXrp: '10' }, terms: 'Task' } });
  const deposit = await service.depositEscrow({ jobId: created.job.id, hirerWallet: 'rHIRER' });

  await service.processXummCallback({ payloadUuid: deposit.tx.uuid, signed: true, txid: 'tx-create-1', txResult: { hash: 'tx-create-1', validated: true, meta: { TransactionResult: 'tesSUCCESS' }, tx_json: { Sequence: 101 }, ledger_index: 20 } });
  const confirmed = await service.confirmEscrowDeposit({ jobId: created.job.id, hirerWallet: 'rHIRER' });

  assert.equal(confirmed.job.status, 'escrowed');
  assert.match(confirmed.job.escrow.createTxHash, /^tx-create-/);
  assert.equal(confirmed.job.escrow.escrowSequence, 77);
});

test('realistic end-to-end async flow', async () => {
  const { service } = makeHarness({ asyncSign: true });
  const created = await service.createJob({ hirerWallet: 'rHIRER', body: { agentId: 'agent-1', offer: { priceXrp: '15' }, terms: 'Deliver report' } });
  const jobId = created.job.id;

  const dep = await service.depositEscrow({ jobId, hirerWallet: 'rHIRER' });
  await service.processXummCallback({ payloadUuid: dep.tx.uuid, signed: true, txid: 'tx-create-2', txResult: { hash: 'tx-create-2', validated: true, meta: { TransactionResult: 'tesSUCCESS' }, tx_json: { Sequence: 91 }, ledger_index: 21 } });
  await service.acceptJob({ jobId, agentWallet: 'rAGENT1' });
  await service.submitWork({ jobId, agentWallet: 'rAGENT1', body: { proof: { type: 'link', value: 'https://example.com' }, files: ['https://example.com/file'], metadata: { score: 1 } } });
  await service.reviewSubmission({ jobId, hirerWallet: 'rHIRER', body: { decision: 'accepted', rating: 5, comment: 'good' } });

  const release = await service.releaseEscrow({ jobId, hirerWallet: 'rHIRER' });
  const final = await service.processXummCallback({ payloadUuid: release.tx.uuid, signed: true, txid: 'tx-finish-2', txResult: { hash: 'tx-finish-2', validated: true, meta: { TransactionResult: 'tesSUCCESS' }, tx_json: {}, ledger_index: 22 } });

  assert.equal(final.job.status, 'completed');
  assert.equal(final.job.escrow.status, 'released');
  assert.deepEqual(final.job.history.map((h) => h.to), ['pending_deposit', 'escrowed', 'accepted_by_agent', 'submitted', 'completed']);
});

test('archive endpoint flow marks job archived', async () => {
  const { service } = makeHarness();
  const created = await service.createJob({ hirerWallet: 'rHIRER', body: { agentId: 'agent-1', offer: { priceXrp: '5' }, terms: 'Task' } });
  const archived = await service.archiveJob({ jobId: created.job.id, actorWallet: 'rHIRER' });
  assert.equal(archived.job.status, 'archived');
});


test('confirmEscrowDeposit uses existing tx hash when payload status is unresolved', async () => {
  const { service } = makeHarness({ asyncSign: true, payloadSigned: false });
  const created = await service.createJob({ hirerWallet: 'rHIRER', body: { agentId: 'agent-1', offer: { priceXrp: '8' }, terms: 'Task' } });
  const jobId = created.job.id;

  await service.depositEscrow({ jobId, hirerWallet: 'rHIRER' });
  await service.processXummCallback({
    payloadUuid: `create-${jobId}`,
    signed: true,
    txid: `tx-create-${jobId}`,
    txResult: { hash: `tx-create-${jobId}`, validated: true, meta: { TransactionResult: 'tesSUCCESS' }, tx_json: { Sequence: 77 }, ledger_index: 10 },
  });

  const result = await service.confirmEscrowDeposit({ jobId, hirerWallet: 'rHIRER' });
  assert.equal(result.job.status, 'escrowed');
  assert.equal(result.payload.validated, true);
});
