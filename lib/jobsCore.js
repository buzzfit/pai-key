function now() {
  return Date.now();
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function average(total, count) {
  if (!count) return 0;
  return Number((total / count).toFixed(2));
}

function perfScore(accepted, rejected, disputed, avgRating) {
  const total = accepted + rejected + disputed;
  const successRatio = total ? accepted / total : 0;
  const score = successRatio * 70 + (avgRating / 5) * 30;
  return Number((score * 100 / 100).toFixed(2));
}

function extractEvidence(body) {
  return {
    evidenceNotes: body?.evidenceNotes || null,
    evidenceLinks: Array.isArray(body?.evidenceLinks) ? body.evidenceLinks : [],
  };
}

const VALID_TRANSITIONS = {
  pending_deposit: ['escrowed', 'archived'],
  escrowed: ['accepted_by_agent', 'refunded', 'disputed', 'archived'],
  accepted_by_agent: ['submitted', 'refunded', 'disputed', 'archived'],
  submitted: ['completed', 'refunded', 'disputed', 'archived'],
  disputed: ['completed', 'refunded', 'archived'],
  refunded: ['archived'],
  completed: ['archived'],
  archived: [],
};

function canTransition(from, to) {
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

function withTransition(job, nextStatus, patch = {}) {
  const timestamp = now();
  const transition = { from: job.status, to: nextStatus, at: timestamp };
  return {
    ...job,
    ...patch,
    status: nextStatus,
    statusTimestamps: {
      ...(job.statusTimestamps || {}),
      [nextStatus]: timestamp,
    },
    history: [...(Array.isArray(job.history) ? job.history : []), transition],
    updatedAt: timestamp,
  };
}

function isSuccessfulTx(tx) {
  return Boolean(tx?.validated && tx?.meta?.TransactionResult === 'tesSUCCESS');
}

export function createJobsService({ store, escrow }) {
  async function findJobByPayloadUuid(payloadUuid) {
    if (store.getJobIdByPayloadUuid) {
      const jobId = await store.getJobIdByPayloadUuid(payloadUuid);
      if (jobId) return store.getJob(jobId);
    }
    const jobs = await store.listJobs({ includeArchived: true });
    return jobs.find((candidate) => (
      candidate?.escrow?.createPayloadUuid === payloadUuid
      || candidate?.escrow?.finishPayloadUuid === payloadUuid
      || candidate?.escrow?.cancelPayloadUuid === payloadUuid
    )) || null;
  }

  async function savePayloadIndex(job, payloadUuid) {
    if (!payloadUuid || !store.indexPayloadUuid) return;
    await store.indexPayloadUuid(payloadUuid, job.id);
  }

  async function createJob({ hirerWallet, body }) {
    const { agentId, offer = {}, terms = '', deadline = null } = body || {};
    const priceXrp = toNum(offer.priceXrp);
    if (!agentId || !Number.isFinite(priceXrp) || priceXrp <= 0 || !terms) {
      return { error: ['InvalidJobPayload', 'Provide agentId, offer.priceXrp > 0, and terms.'], status: 400 };
    }

    const resolved = await store.loadAgent(agentId);
    if (!resolved?.record) {
      return { error: ['AgentNotFound', 'No docked agent found for provided agentId.'], status: 404 };
    }

    const id = crypto.randomUUID();
    const createdAt = now();
    const job = {
      id,
      status: 'pending_deposit',
      hirerWallet,
      agentId,
      agentWallet: resolved.record.payoutAccount || resolved.record.vendorAccount,
      agentOrigin: resolved.origin,
      offer: { priceXrp: String(priceXrp), currency: 'XRP' },
      terms,
      deadline,
      submission: null,
      review: null,
      escrow: { status: 'none' },
      dispute: null,
      statusTimestamps: { pending_deposit: createdAt },
      history: [{ from: null, to: 'pending_deposit', at: createdAt }],
      archivedBy: [],
      createdAt,
      updatedAt: createdAt,
    };

    await store.createJob(job);
    return { job, status: 201 };
  }

  async function depositEscrow({ jobId, hirerWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can deposit.'], status: 403 };
    if (!canTransition(job.status, 'escrowed')) return { error: ['InvalidState', 'Job is not pending deposit.'], status: 409 };

    const tx = await escrow.createEscrow({
      jobId,
      fromWallet: hirerWallet,
      toWallet: job.agentWallet,
      amountXrp: job.offer.priceXrp,
    });

    if (tx?.action === 'signature_required') {
      const next = {
        ...job,
        escrow: {
          ...job.escrow,
          status: 'awaiting_deposit_signature',
          amountXrp: job.offer.priceXrp,
          amountDrops: tx.amountDrops || null,
          createPayloadUuid: tx.uuid,
          createSignUrl: tx.signUrl,
          finishAfter: tx.finishAfter || null,
          cancelAfter: tx.cancelAfter || null,
        },
        updatedAt: now(),
      };
      await store.updateJob(next);
      if (store.indexPayloadUuid) {
        await store.indexPayloadUuid(tx.uuid, job.id);
      }
      return { job: next, tx, status: 200 };
    }

    const next = withTransition(job, 'escrowed', {
      escrow: {
        status: 'funded',
        funded: job.hirerWallet,
        amountXrp: job.offer.priceXrp,
        createTxHash: tx.txHash,
        escrowSequence: tx.escrowSequence,
        createLedgerIndex: tx.ledgerIndex,
      },
    });
    await store.updateJob(next);
    return { job: next, tx, status: 200 };
  }

  async function confirmEscrowDeposit({ jobId, hirerWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can inspect escrow status.'], status: 403 };

    const uuid = job.escrow?.createPayloadUuid;
    let txid = job.escrow?.createTxHash || null;
    let signed = Boolean(txid);
    let resolved = false;

    console.info('[EscrowConfirm]', { jobId, payloadUuid: uuid, txid, phase: 'deposit_status_check_start' });

    if (uuid) {
      const payload = await escrow.getPayloadStatus(uuid).catch(() => null);
      signed = Boolean(payload?.meta?.signed) || signed;
      resolved = Boolean(payload?.meta?.resolved);
      txid = payload?.response?.txid || txid;
      if (txid && !job.escrow?.createTxHash) {
        const txidPersisted = {
          ...job,
          escrow: { ...job.escrow, createTxHash: txid },
          updatedAt: now(),
        };
        await store.updateJob(txidPersisted);
      }
      if (!txid) {
        return { status: 200, payload: { signed, resolved, txid }, job };
      }
    }

    if (!txid) return { error: ['MissingEscrowPayload', 'No escrow deposit payload or transaction hash is available.'], status: 409 };

    const tx = await escrow.lookupTransaction(txid).catch(() => null);
    console.log('[ESCROW STATUS CHECK]', {
      jobId,
      payloadUuid: uuid,
      txid,
      validated: tx?.validated,
      result: tx?.meta?.TransactionResult,
    });
    if (!isSuccessfulTx(tx)) {
      console.info('[EscrowConfirm]', { jobId, payloadUuid: uuid, txid, phase: 'deposit_not_validated', newStatus: job.status });
      return { status: 200, payload: { signed, txid, validated: false }, job };
    }

    if (job.status === 'escrowed' && job.escrow?.status === 'funded') {
      const current = {
        ...job,
        escrow: {
          ...job.escrow,
          createTxHash: tx.hash || txid,
          funded: job.escrow?.funded || job.hirerWallet,
          escrowSequence: job.escrow?.escrowSequence || tx.tx_json?.Sequence,
          createLedgerIndex: job.escrow?.createLedgerIndex || tx.ledger_index || null,
        },
      };
      await store.updateJob(current);
      console.info('[EscrowConfirm]', { jobId, payloadUuid: uuid, txid: tx.hash || txid, newStatus: current.status });
      return { status: 200, payload: { signed: true, txid: tx.hash || txid, validated: true }, job: current };
    }

    const next = withTransition(job, 'escrowed', {
      escrow: {
        ...job.escrow,
        status: 'funded',
        createTxHash: tx.hash || txid,
        funded: job.escrow?.funded || job.hirerWallet,
        escrowSequence: tx.tx_json?.Sequence,
        createLedgerIndex: tx.ledger_index || null,
      },
    });
    await store.updateJob(next);
    console.info('[EscrowConfirm]', { jobId, payloadUuid: uuid, txid: tx.hash || txid, newStatus: next.status });
    return { status: 200, payload: { signed: true, txid: tx.hash || txid, validated: true }, job: next };
  }

  async function acceptJob({ jobId, agentWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.agentWallet !== agentWallet) return { error: ['Forbidden', 'Only assigned agent can accept.'], status: 403 };
    if (!canTransition(job.status, 'accepted_by_agent')) return { error: ['InvalidState', 'Job must be escrowed to accept.'], status: 409 };

    const next = withTransition(job, 'accepted_by_agent', { acceptedAt: now() });
    await store.updateJob(next);
    await store.updateAgentReputation(job.agentId, (agent) => ({ ...agent, busy: true }));
    return { job: next, status: 200 };
  }

  async function submitWork({ jobId, agentWallet, body }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.agentWallet !== agentWallet) return { error: ['Forbidden', 'Only assigned agent can submit.'], status: 403 };
    if (!canTransition(job.status, 'submitted')) return { error: ['InvalidState', 'Job must be accepted before submission.'], status: 409 };

    const proof = body?.proof;
    if (!proof) return { error: ['MissingProof', 'Submission proof is required.'], status: 400 };

    const next = withTransition(job, 'submitted', {
      submission: {
        proof,
        payload: body?.payload || null,
        files: Array.isArray(body?.files) ? body.files : [],
        metadata: body?.metadata || null,
        notes: body?.notes || null,
        submittedAt: now(),
      },
    });
    await store.updateJob(next);
    return { job: next, status: 200 };
  }

  async function reviewSubmission({ jobId, hirerWallet, body }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can review.'], status: 403 };
    if (job.status !== 'submitted') return { error: ['InvalidState', 'Job must be submitted before review.'], status: 409 };

    const decision = body?.decision;
    if (!['accepted', 'rejected', 'disputed'].includes(decision)) {
      return { error: ['InvalidDecision', 'decision must be accepted, rejected, or disputed.'], status: 400 };
    }

    const rating = body?.rating == null ? null : Number(body.rating);
    if (rating != null && (!Number.isFinite(rating) || rating < 1 || rating > 5)) {
      return { error: ['InvalidRating', 'rating must be between 1 and 5.'], status: 400 };
    }

    if (decision === 'accepted') {
      const next = {
        ...job,
        review: {
          decision,
          comment: body?.comment || null,
          rating,
          reviewedAt: now(),
        },
        updatedAt: now(),
      };
      await store.updateJob(next);
      return { job: next, status: 200 };
    }

    let dispute = null;
    let nextStatus = 'refunded';
    if (decision === 'disputed') {
      nextStatus = 'disputed';
      dispute = {
        id: crypto.randomUUID(),
        jobId,
        status: 'open',
        openedBy: hirerWallet,
        reason: body?.comment || 'Disputed by hirer',
        ...extractEvidence(body),
        notes: [],
        createdAt: now(),
        updatedAt: now(),
      };
      await store.saveDispute(dispute);
    }

    const next = withTransition(job, nextStatus, {
      review: {
        decision,
        comment: body?.comment || null,
        rating,
        reviewedAt: now(),
      },
      dispute: dispute ? { id: dispute.id, status: dispute.status } : null,
    });

    await store.updateJob(next);
    return { job: next, dispute, status: 200 };
  }

  async function releaseEscrow({ jobId, hirerWallet, force = false }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can release.'], status: 403 };

    const releasableStates = force ? ['submitted', 'disputed'] : ['submitted'];
    if (!releasableStates.includes(job.status)) return { error: ['InvalidState', 'Job must be submitted before release.'], status: 409 };
    if (!force && job.review?.decision !== 'accepted') return { error: ['InvalidState', 'Submission must be accepted before release.'], status: 409 };

    const tx = await escrow.finishEscrow({
      jobId,
      fromWallet: hirerWallet,
      escrowOwner: hirerWallet,
      escrowSequence: job.escrow?.escrowSequence,
    });

    if (tx?.action === 'signature_required') {
      const next = {
        ...job,
        escrow: { ...job.escrow, status: 'awaiting_release_signature', finishPayloadUuid: tx.uuid, finishSignUrl: tx.signUrl },
        updatedAt: now(),
      };
      await store.updateJob(next);
      if (store.indexPayloadUuid) {
        await store.indexPayloadUuid(tx.uuid, job.id);
      }
      return { job: next, tx, status: 200 };
    }

    const next = withTransition(job, 'completed', {
      escrow: { ...job.escrow, status: 'released', finishTxHash: tx.txHash, finishLedgerIndex: tx.ledgerIndex },
    });
    await store.updateJob(next);
    await finalizeAgentOnCompletion(next);
    return { job: next, tx, status: 200 };
  }

  async function confirmEscrowRelease({ jobId, hirerWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can inspect release status.'], status: 403 };

    const uuid = job.escrow?.finishPayloadUuid;
    let txid = job.escrow?.finishTxHash || null;
    let signed = Boolean(txid);

    if (uuid) {
      const payload = await escrow.getPayloadStatus(uuid);
      signed = Boolean(payload?.meta?.signed);
      txid = payload?.response?.txid || txid;
      if (!signed || !txid) return { status: 200, payload: { signed, resolved: Boolean(payload?.meta?.resolved), txid }, job };
    }

    if (!txid) return { error: ['MissingReleasePayload', 'No release payload or transaction hash is available.'], status: 409 };

    const tx = await escrow.lookupTransaction(txid).catch(() => null);
    if (!isSuccessfulTx(tx)) {
      console.info('[confirmEscrowDeposit] tx not validated', { jobId, payloadUuid: uuid, txid });
      return { status: 200, payload: { signed, txid, validated: false }, job };
    }

    const next = withTransition(job, 'completed', {
      escrow: { ...job.escrow, status: 'released', finishTxHash: tx.hash || txid, finishLedgerIndex: tx.ledger_index || null },
    });
    await store.updateJob(next);
    await finalizeAgentOnCompletion(next);
    return { status: 200, payload: { signed: true, txid: tx.hash || txid, validated: true }, job: next };
  }

  async function finalizeAgentOnCompletion(job) {
    await store.updateAgentReputation(job.agentId, (agent) => {
      const completedJobs = Number(agent.completed_jobs || 0) + 1;
      const acceptedReviews = Number(agent.accepted_reviews || 0) + 1;
      const rejectedReviews = Number(agent.rejected_reviews || 0);
      const disputedReviews = Number(agent.disputed_reviews || 0);
      const totalRatings = Number(agent.total_ratings || 0) + (Number(job.review?.rating || 0) || 0);
      const ratingsCount = Number(agent.ratings_count || 0) + (job.review?.rating ? 1 : 0);
      const avgRating = average(totalRatings, ratingsCount);
      return {
        ...agent,
        busy: false,
        completed_jobs: completedJobs,
        accepted_reviews: acceptedReviews,
        rejected_reviews: rejectedReviews,
        disputed_reviews: disputedReviews,
        total_ratings: totalRatings,
        ratings_count: ratingsCount,
        avg_rating: avgRating,
        performance_score: perfScore(acceptedReviews, rejectedReviews, disputedReviews, avgRating),
      };
    });
  }

  async function refundEscrow({ jobId, hirerWallet, reason = 'Refunded by hirer' }) {
    console.log('[REFUND START]', jobId);
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can refund.'], status: 403 };
    if (!['disputed', 'escrowed', 'submitted', 'accepted_by_agent'].includes(job.status)) {
      return { error: ['InvalidState', 'Job cannot be refunded in current state.'], status: 409 };
    }

    if (!job.escrow?.escrowSequence || !job.escrow?.funded || !job.escrow?.createTxHash) {
      return { error: ['MissingEscrowDetails', 'Escrow details are incomplete for refund.'], status: 409 };
    }

    const tx = await escrow.cancelEscrow({
      jobId,
      fromWallet: hirerWallet,
      escrowOwner: job.escrow.funded,
      escrowSequence: job.escrow?.escrowSequence,
    });

    if (tx?.action === 'signature_required') {
      const next = {
        ...job,
        escrow: {
          ...job.escrow,
          status: 'awaiting_refund_signature',
          cancelPayloadUuid: tx.uuid,
          cancelSignUrl: tx.signUrl,
        },
        updatedAt: now(),
      };
      await store.updateJob(next);
      await savePayloadIndex(next, tx.uuid);
      console.log('[REFUND PAYLOAD CREATED]', tx.uuid);
      return { job: next, tx, status: 200 };
    }

    const next = withTransition(job, 'refunded', {
      escrow: {
        ...job.escrow,
        status: 'refunded',
        cancelTxHash: tx.txHash,
        cancelLedgerIndex: tx.ledgerIndex,
      },
      refund: { reason, refundedAt: now() },
    });
    await store.updateJob(next);
    console.log('[REFUND CONFIRMED]', tx.txHash);

    await store.updateAgentReputation(job.agentId, (agent) => {
      const acceptedReviews = Number(agent.accepted_reviews || 0);
      const rejectedReviews = Number(agent.rejected_reviews || 0) + 1;
      const disputedReviews = Number(agent.disputed_reviews || 0) + (job.status === 'disputed' ? 1 : 0);
      const avgRating = Number(agent.avg_rating || 0);
      return {
        ...agent,
        busy: false,
        rejected_reviews: rejectedReviews,
        disputed_reviews: disputedReviews,
        performance_score: perfScore(acceptedReviews, rejectedReviews, disputedReviews, avgRating),
      };
    });

    return { job: next, tx, status: 200 };
  }

  async function confirmEscrowRefund({ jobId, hirerWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can inspect refund status.'], status: 403 };

    const uuid = job.escrow?.cancelPayloadUuid;
    let txid = job.escrow?.cancelTxHash || null;
    let signed = Boolean(txid);
    let resolved = false;

    if (uuid) {
      const payload = await escrow.getPayloadStatus(uuid).catch(() => null);
      signed = Boolean(payload?.meta?.signed) || signed;
      resolved = Boolean(payload?.meta?.resolved);
      txid = payload?.response?.txid || txid;
      if (txid && !job.escrow?.cancelTxHash) {
        const withTxid = {
          ...job,
          escrow: { ...job.escrow, cancelTxHash: txid },
          updatedAt: now(),
        };
        await store.updateJob(withTxid);
      }
      if (!txid) {
        return { status: 200, payload: { signed, resolved, txid }, job };
      }
    }

    if (!txid) return { error: ['MissingRefundPayload', 'No refund payload or transaction hash is available.'], status: 409 };

    const tx = await escrow.lookupTransaction(txid).catch(() => null);
    if (!isSuccessfulTx(tx)) {
      return { status: 200, payload: { signed, txid, validated: false }, job };
    }

    if (job.status === 'refunded' && job.escrow?.status === 'refunded') {
      const current = {
        ...job,
        escrow: {
          ...job.escrow,
          cancelTxHash: tx.hash || txid,
          cancelLedgerIndex: job.escrow?.cancelLedgerIndex || tx.ledger_index || null,
        },
      };
      await store.updateJob(current);
      console.log('[REFUND CONFIRMED]', tx.hash || txid);
      return { status: 200, payload: { signed: true, txid: tx.hash || txid, validated: true }, job: current };
    }

    if (!canTransition(job.status, 'refunded')) {
      return { error: ['InvalidState', 'Job cannot transition to refunded in current state.'], status: 409 };
    }

    const next = withTransition(job, 'refunded', {
      escrow: {
        ...job.escrow,
        status: 'refunded',
        cancelTxHash: tx.hash || txid,
        cancelLedgerIndex: tx.ledger_index || null,
      },
      refund: job.refund || { reason: 'Refunded by hirer', refundedAt: now() },
    });
    await store.updateJob(next);

    await store.updateAgentReputation(job.agentId, (agent) => {
      const acceptedReviews = Number(agent.accepted_reviews || 0);
      const rejectedReviews = Number(agent.rejected_reviews || 0) + 1;
      const disputedReviews = Number(agent.disputed_reviews || 0) + (job.status === 'disputed' ? 1 : 0);
      const avgRating = Number(agent.avg_rating || 0);
      return {
        ...agent,
        busy: false,
        rejected_reviews: rejectedReviews,
        disputed_reviews: disputedReviews,
        performance_score: perfScore(acceptedReviews, rejectedReviews, disputedReviews, avgRating),
      };
    });

    console.log('[REFUND CONFIRMED]', tx.hash || txid);
    return { status: 200, payload: { signed: true, txid: tx.hash || txid, validated: true }, job: next };
  }

  async function openDispute({ jobId, actorWallet, reason, body }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== actorWallet && job.agentWallet !== actorWallet) {
      return { error: ['Forbidden', 'Only job participants can open disputes.'], status: 403 };
    }

    let dispute = await store.getDispute(jobId);
    if (!dispute) {
      dispute = {
        id: crypto.randomUUID(),
        jobId,
        status: 'open',
        openedBy: actorWallet,
        reason: reason || 'Escalated by participant',
        ...extractEvidence(body),
        notes: [],
        createdAt: now(),
        updatedAt: now(),
      };
    } else {
      dispute = {
        ...dispute,
        status: 'open',
        escalatedBy: actorWallet,
        reason: reason || dispute.reason,
        evidenceNotes: body?.evidenceNotes || dispute.evidenceNotes || null,
        evidenceLinks: body?.evidenceLinks || dispute.evidenceLinks || [],
        notes: [
          ...(Array.isArray(dispute.notes) ? dispute.notes : []),
          ...(body?.note ? [{ actor: actorWallet, note: body.note, createdAt: now() }] : []),
        ],
        updatedAt: now(),
      };
    }

    await store.saveDispute(dispute);
    const next = withTransition(job, 'disputed', { dispute: { id: dispute.id, status: 'open' } });
    await store.updateJob(next);
    return { job: next, dispute, status: 200 };
  }

  async function resolveDispute({ jobId, resolver, body }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    const dispute = await store.getDispute(jobId);
    if (!dispute) return { error: ['DisputeNotFound', 'No open dispute exists.'], status: 404 };

    const resolution = body?.resolution;
    if (!['release', 'refund'].includes(resolution)) {
      return { error: ['InvalidResolution', 'resolution must be release or refund.'], status: 400 };
    }

    const resolvedDispute = {
      ...dispute,
      status: 'resolved',
      resolution,
      resolutionNote: body?.note || null,
      evidenceNotes: body?.evidenceNotes || dispute.evidenceNotes || null,
      evidenceLinks: body?.evidenceLinks || dispute.evidenceLinks || [],
      resolvedBy: resolver,
      resolvedAt: now(),
      updatedAt: now(),
    };
    await store.saveDispute(resolvedDispute);

    if (resolution === 'release') {
      const released = await releaseEscrow({ jobId, hirerWallet: job.hirerWallet, force: true });
      if (released.error) return released;
      return { ...released, dispute: resolvedDispute };
    }

    const refunded = await refundEscrow({ jobId, hirerWallet: job.hirerWallet, reason: 'Dispute resolved in favor of hirer' });
    if (refunded.error) return refunded;
    return { ...refunded, dispute: resolvedDispute };
  }

  async function processXummCallback({ payloadUuid, signed, txid, txResult = null, dispatchedResult = null }) {
    console.info('[EscrowConfirm]', { payloadUuid, txid, phase: 'webhook_received', signed, dispatchedResult });
    const job = await findJobByPayloadUuid(payloadUuid);
    if (!job?.id) {
      console.info('[EscrowConfirm]', { payloadUuid, txid, phase: 'webhook_job_not_found' });
      return { error: ['JobNotFound', 'No job matches this Xumm payload UUID.'], status: 404 };
    }

    if (!signed) {
      return { status: 200, ignored: true, reason: dispatchedResult || 'rejected', job };
    }

    const hash = txid || job.escrow?.createTxHash || job.escrow?.finishTxHash || job.escrow?.cancelTxHash;
    if (!hash) return { status: 200, ignored: true, reason: 'missing_txid', job };

    if (job.escrow?.createPayloadUuid === payloadUuid) {
      const tx = txResult || await escrow.lookupTransaction(hash).catch(() => null);
      if (!isSuccessfulTx(tx)) return { status: 200, ignored: true, reason: 'create_not_validated', job };
      const next = withTransition(job, 'escrowed', {
        escrow: {
          ...job.escrow,
          status: 'funded',
          createTxHash: tx.hash || hash,
          funded: job.escrow?.funded || job.hirerWallet,
          escrowSequence: tx.tx_json?.Sequence,
          createLedgerIndex: tx.ledger_index || null,
        },
      });
      await store.updateJob(next);
      console.info('[EscrowConfirm]', { jobId: job.id, payloadUuid, txid: tx.hash || hash, newStatus: next.status });
      return { status: 200, job: next };
    }

    if (job.escrow?.cancelPayloadUuid === payloadUuid) {
      const cancelTx = txResult || await escrow.lookupTransaction(hash).catch(() => null);
      if (!isSuccessfulTx(cancelTx)) return { status: 200, ignored: true, reason: 'cancel_not_validated', job };
      if (!canTransition(job.status, 'refunded') && job.status !== 'refunded') {
        return { status: 200, ignored: true, reason: 'cancel_invalid_state', job };
      }

      const next = job.status === 'refunded'
        ? {
          ...job,
          escrow: {
            ...job.escrow,
            status: 'refunded',
            cancelTxHash: cancelTx.hash || hash,
            cancelLedgerIndex: job.escrow?.cancelLedgerIndex || cancelTx.ledger_index || null,
          },
          updatedAt: now(),
        }
        : withTransition(job, 'refunded', {
          escrow: {
            ...job.escrow,
            status: 'refunded',
            cancelTxHash: cancelTx.hash || hash,
            cancelLedgerIndex: cancelTx.ledger_index || null,
          },
          refund: job.refund || { reason: 'Refunded by hirer', refundedAt: now() },
        });

      await store.updateJob(next);
      if (job.status !== 'refunded') {
        await store.updateAgentReputation(job.agentId, (agent) => {
          const acceptedReviews = Number(agent.accepted_reviews || 0);
          const rejectedReviews = Number(agent.rejected_reviews || 0) + 1;
          const disputedReviews = Number(agent.disputed_reviews || 0) + (job.status === 'disputed' ? 1 : 0);
          const avgRating = Number(agent.avg_rating || 0);
          return {
            ...agent,
            busy: false,
            rejected_reviews: rejectedReviews,
            disputed_reviews: disputedReviews,
            performance_score: perfScore(acceptedReviews, rejectedReviews, disputedReviews, avgRating),
          };
        });
      }

      console.log('[REFUND CONFIRMED]', cancelTx.hash || hash);
      return { status: 200, job: next };
    }

    const finishTx = txResult || await escrow.lookupTransaction(hash).catch(() => null);
    if (!isSuccessfulTx(finishTx)) return { status: 200, ignored: true, reason: 'finish_not_validated', job };
    if (job.status === 'disputed') return { status: 200, ignored: true, reason: 'job_disputed', job };

    const next = withTransition(job, 'completed', {
      escrow: { ...job.escrow, status: 'released', finishTxHash: finishTx.hash || hash, finishLedgerIndex: finishTx.ledger_index || null },
    });
    await store.updateJob(next);
    await finalizeAgentOnCompletion(next);
    console.info('[EscrowConfirm]', { jobId: job.id, payloadUuid, txid: finishTx.hash || hash, newStatus: next.status });
    return { status: 200, job: next };
  }

  async function archiveJob({ jobId, actorWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (![job.hirerWallet, job.agentWallet].includes(actorWallet)) {
      return { error: ['Forbidden', 'Only participants can archive this job.'], status: 403 };
    }

    const archivedBy = Array.from(new Set([...(Array.isArray(job.archivedBy) ? job.archivedBy : []), actorWallet]));
    const nextStatus = ['completed', 'refunded', 'pending_deposit', 'escrowed', 'accepted_by_agent', 'submitted', 'disputed'].includes(job.status)
      ? 'archived'
      : job.status;

    if (nextStatus === 'archived' && !canTransition(job.status, 'archived')) {
      return { error: ['InvalidState', `Cannot archive from ${job.status}`], status: 409 };
    }

    const next = nextStatus === 'archived'
      ? withTransition(job, 'archived', { archivedBy })
      : { ...job, archivedBy, updatedAt: now() };
    await store.updateJob(next);
    return { job: next, status: 200 };
  }

  return {
    createJob,
    depositEscrow,
    confirmEscrowDeposit,
    acceptJob,
    submitWork,
    reviewSubmission,
    releaseEscrow,
    confirmEscrowRelease,
    confirmEscrowRefund,
    refundEscrow,
    openDispute,
    resolveDispute,
    processXummCallback,
    archiveJob,
    listJobs: store.listJobs,
  };
}
