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
  pending_deposit: ['escrowed'],
  escrowed: ['accepted_by_agent', 'refunded', 'disputed'],
  accepted_by_agent: ['submitted', 'refunded', 'disputed'],
  submitted: ['accepted', 'rejected', 'disputed'],
  accepted: ['completed', 'disputed'],
  completed: [],
  rejected: ['disputed', 'refunded'],
  disputed: ['completed', 'refunded'],
  refunded: [],
};

function ensureTransition(from, to) {
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

export function createJobsService({ store, escrow }) {
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
    if (!ensureTransition(job.status, 'escrowed')) return { error: ['InvalidState', 'Job is not pending deposit.'], status: 409 };

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
      return { job: next, tx, status: 200 };
    }

    const next = {
      ...job,
      status: 'escrowed',
      escrow: {
        status: 'funded',
        amountXrp: job.offer.priceXrp,
        createTxHash: tx.txHash,
        escrowSequence: tx.escrowSequence,
        createLedgerIndex: tx.ledgerIndex,
      },
      updatedAt: now(),
    };
    await store.updateJob(next);
    return { job: next, tx, status: 200 };
  }

  async function confirmEscrowDeposit({ jobId, hirerWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can inspect escrow status.'], status: 403 };

    const uuid = job.escrow?.createPayloadUuid;
    if (!uuid) return { error: ['MissingEscrowPayload', 'No escrow deposit payload is available.'], status: 409 };

    const payload = await escrow.getPayloadStatus(uuid);
    const signed = Boolean(payload?.meta?.signed);
    const txid = payload?.response?.txid || null;

    if (!signed || !txid) {
      return { status: 200, payload: { signed, resolved: Boolean(payload?.meta?.resolved), txid }, job };
    }

    const tx = await escrow.lookupTransaction(txid);
    if (!tx?.validated || tx?.meta?.TransactionResult !== 'tesSUCCESS') {
      return { status: 200, payload: { signed, txid, validated: false }, job };
    }

    const next = {
      ...job,
      status: 'escrowed',
      escrow: {
        ...job.escrow,
        status: 'funded',
        createTxHash: tx.hash || txid,
        escrowSequence: tx.tx_json?.Sequence,
        createLedgerIndex: tx.ledger_index || null,
      },
      updatedAt: now(),
    };
    await store.updateJob(next);
    return { status: 200, payload: { signed: true, txid: tx.hash || txid, validated: true }, job: next };
  }

  async function acceptJob({ jobId, agentWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.agentWallet !== agentWallet) return { error: ['Forbidden', 'Only assigned agent can accept.'], status: 403 };
    if (!ensureTransition(job.status, 'accepted_by_agent')) return { error: ['InvalidState', 'Job must be escrowed to accept.'], status: 409 };

    const next = { ...job, status: 'accepted_by_agent', acceptedAt: now(), updatedAt: now() };
    await store.updateJob(next);
    await store.updateAgentReputation(job.agentId, (agent) => ({ ...agent, busy: true }));
    return { job: next, status: 200 };
  }

  async function submitWork({ jobId, agentWallet, body }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.agentWallet !== agentWallet) return { error: ['Forbidden', 'Only assigned agent can submit.'], status: 403 };
    if (!ensureTransition(job.status, 'submitted')) return { error: ['InvalidState', 'Job must be accepted before submission.'], status: 409 };

    const proof = body?.proof;
    if (!proof) return { error: ['MissingProof', 'Submission proof is required.'], status: 400 };

    const next = {
      ...job,
      status: 'submitted',
      submission: {
        proof,
        payload: body?.payload || null,
        notes: body?.notes || null,
        submittedAt: now(),
      },
      updatedAt: now(),
    };
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

    let nextStatus = 'accepted';
    let dispute = null;
    if (decision !== 'accepted') {
      nextStatus = decision === 'rejected' ? 'rejected' : 'disputed';
      dispute = {
        id: crypto.randomUUID(),
        jobId,
        status: 'open',
        openedBy: hirerWallet,
        reason: body?.comment || (decision === 'rejected' ? 'Rejected by hirer' : 'Disputed by hirer'),
        ...extractEvidence(body),
        notes: [],
        createdAt: now(),
        updatedAt: now(),
      };
      await store.saveDispute(dispute);
    }

    const next = {
      ...job,
      status: nextStatus,
      review: {
        decision,
        comment: body?.comment || null,
        rating,
        reviewedAt: now(),
      },
      dispute: dispute ? { id: dispute.id, status: dispute.status } : null,
      updatedAt: now(),
    };

    await store.updateJob(next);
    return { job: next, dispute, status: 200 };
  }

  async function releaseEscrow({ jobId, hirerWallet, force = false }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can release.'], status: 403 };
    const releasableStates = force ? ['accepted', 'disputed'] : ['accepted'];
    if (!releasableStates.includes(job.status)) {
      return { error: ['InvalidState', 'Job must be accepted before release.'], status: 409 };
    }

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
      return { job: next, tx, status: 200 };
    }

    const next = {
      ...job,
      status: 'completed',
      escrow: { ...job.escrow, status: 'released', finishTxHash: tx.txHash, finishLedgerIndex: tx.ledgerIndex },
      updatedAt: now(),
    };
    await store.updateJob(next);
    await finalizeAgentOnCompletion(job);
    return { job: next, tx, status: 200 };
  }

  async function confirmEscrowRelease({ jobId, hirerWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can inspect release status.'], status: 403 };
    const uuid = job.escrow?.finishPayloadUuid;
    if (!uuid) return { error: ['MissingReleasePayload', 'No release payload is available.'], status: 409 };

    const payload = await escrow.getPayloadStatus(uuid);
    const signed = Boolean(payload?.meta?.signed);
    const txid = payload?.response?.txid || null;
    if (!signed || !txid) return { status: 200, payload: { signed, resolved: Boolean(payload?.meta?.resolved), txid }, job };

    const tx = await escrow.lookupTransaction(txid);
    if (!tx?.validated || tx?.meta?.TransactionResult !== 'tesSUCCESS') {
      return { status: 200, payload: { signed, txid, validated: false }, job };
    }

    const next = {
      ...job,
      status: 'completed',
      escrow: { ...job.escrow, status: 'released', finishTxHash: tx.hash || txid, finishLedgerIndex: tx.ledger_index || null },
      updatedAt: now(),
    };
    await store.updateJob(next);
    await finalizeAgentOnCompletion(job);
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
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can refund.'], status: 403 };
    if (!['disputed', 'escrowed', 'submitted', 'accepted_by_agent', 'rejected'].includes(job.status)) {
      return { error: ['InvalidState', 'Job cannot be refunded in current state.'], status: 409 };
    }

    const tx = await escrow.cancelEscrow({
      jobId,
      fromWallet: hirerWallet,
      escrowOwner: hirerWallet,
      escrowSequence: job.escrow?.escrowSequence,
    });

    const next = {
      ...job,
      status: 'refunded',
      escrow: {
        ...job.escrow,
        status: 'refunded',
        cancelTxHash: tx.txHash,
        cancelLedgerIndex: tx.ledgerIndex,
      },
      refund: { reason, refundedAt: now() },
      updatedAt: now(),
    };
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

    return { job: next, tx, status: 200 };
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
    const next = { ...job, status: 'disputed', dispute: { id: dispute.id, status: 'open' }, updatedAt: now() };
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

  async function processXummCallback({ payloadUuid, signed, txid, txResult = null }) {
    const jobs = await store.listJobs({});
    const job = jobs.find((candidate) => candidate?.escrow?.createPayloadUuid === payloadUuid || candidate?.escrow?.finishPayloadUuid === payloadUuid);
    if (!job?.id) return { error: ['JobNotFound', 'No job matches this Xumm payload UUID.'], status: 404 };
    if (!signed || !txid) return { status: 200, ignored: true, job };

    if (job.escrow?.createPayloadUuid === payloadUuid) {
      const tx = txResult || await escrow.lookupTransaction(txid);
      if (!tx?.validated || tx?.meta?.TransactionResult !== 'tesSUCCESS') return { status: 200, ignored: true, job };
      const next = {
        ...job,
        status: 'escrowed',
        escrow: {
          ...job.escrow,
          status: 'funded',
          createTxHash: tx.hash || txid,
          escrowSequence: tx.tx_json?.Sequence,
          createLedgerIndex: tx.ledger_index || null,
        },
        updatedAt: now(),
      };
      await store.updateJob(next);
      return { status: 200, job: next };
    }

    const finishTx = txResult || await escrow.lookupTransaction(txid);
    if (!finishTx?.validated || finishTx?.meta?.TransactionResult !== 'tesSUCCESS') return { status: 200, ignored: true, job };
    if (job.status === 'disputed') return { status: 200, ignored: true, job };
    const next = {
      ...job,
      status: 'completed',
      escrow: { ...job.escrow, status: 'released', finishTxHash: finishTx.hash || txid, finishLedgerIndex: finishTx.ledger_index || null },
      updatedAt: now(),
    };
    await store.updateJob(next);
    await finalizeAgentOnCompletion(job);
    return { status: 200, job: next };
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
    refundEscrow,
    openDispute,
    resolveDispute,
    processXummCallback,
    listJobs: store.listJobs,
  };
}
