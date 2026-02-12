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
    if (job.status !== 'pending_deposit') return { error: ['InvalidState', 'Job is not pending deposit.'], status: 409 };

    const tx = await escrow.createEscrow({
      jobId,
      fromWallet: hirerWallet,
      toWallet: job.agentWallet,
      amountXrp: job.offer.priceXrp,
    });

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

  async function submitWork({ jobId, agentWallet, body }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.agentWallet !== agentWallet) return { error: ['Forbidden', 'Only assigned agent can submit.'], status: 403 };
    if (job.status !== 'escrowed') return { error: ['InvalidState', 'Job must be escrowed before submission.'], status: 409 };

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

    let nextStatus = 'accepted_pending_release';
    let dispute = null;
    if (decision !== 'accepted') {
      nextStatus = 'disputed';
      dispute = {
        id: crypto.randomUUID(),
        jobId,
        status: 'open',
        openedBy: hirerWallet,
        reason: body?.comment || (decision === 'rejected' ? 'Rejected by hirer' : 'Disputed by hirer'),
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

  async function releaseEscrow({ jobId, hirerWallet }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can release.'], status: 403 };
    if (job.status !== 'accepted_pending_release') {
      return { error: ['InvalidState', 'Job must be accepted before release.'], status: 409 };
    }

    const tx = await escrow.finishEscrow({
      jobId,
      toWallet: job.agentWallet,
      escrowSequence: job.escrow?.escrowSequence,
    });

    const next = {
      ...job,
      status: 'completed',
      escrow: {
        ...job.escrow,
        status: 'released',
        finishTxHash: tx.txHash,
        finishLedgerIndex: tx.ledgerIndex,
      },
      updatedAt: now(),
    };
    await store.updateJob(next);

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

    return { job: next, tx, status: 200 };
  }

  async function refundEscrow({ jobId, hirerWallet, reason = 'Refunded by hirer' }) {
    const job = await store.getJob(jobId);
    if (!job?.id) return { error: ['JobNotFound', 'Job does not exist.'], status: 404 };
    if (job.hirerWallet !== hirerWallet) return { error: ['Forbidden', 'Only hirer can refund.'], status: 403 };
    if (!['disputed', 'escrowed', 'submitted'].includes(job.status)) {
      return { error: ['InvalidState', 'Job cannot be refunded in current state.'], status: 409 };
    }

    const tx = await escrow.cancelEscrow({
      jobId,
      fromWallet: hirerWallet,
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
        rejected_reviews: rejectedReviews,
        disputed_reviews: disputedReviews,
        performance_score: perfScore(acceptedReviews, rejectedReviews, disputedReviews, avgRating),
      };
    });

    return { job: next, tx, status: 200 };
  }

  async function openDispute({ jobId, actorWallet, reason }) {
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
        createdAt: now(),
        updatedAt: now(),
      };
    } else {
      dispute = {
        ...dispute,
        status: 'open',
        escalatedBy: actorWallet,
        reason: reason || dispute.reason,
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
      resolvedBy: resolver,
      resolvedAt: now(),
      updatedAt: now(),
    };
    await store.saveDispute(resolvedDispute);

    if (resolution === 'release') {
      const released = await releaseEscrow({ jobId, hirerWallet: job.hirerWallet });
      if (released.error) return released;
      return { ...released, dispute: resolvedDispute };
    }

    const refunded = await refundEscrow({ jobId, hirerWallet: job.hirerWallet, reason: 'Dispute resolved in favor of hirer' });
    if (refunded.error) return refunded;
    return { ...refunded, dispute: resolvedDispute };
  }

  return {
    createJob,
    depositEscrow,
    submitWork,
    reviewSubmission,
    releaseEscrow,
    refundEscrow,
    openDispute,
    resolveDispute,
    listJobs: store.listJobs,
  };
}
