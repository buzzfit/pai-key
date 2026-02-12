const XRPL_ESCROW_MODE = process.env.XRPL_ESCROW_MODE || 'mock';

function requireRelayUrl() {
  if (!process.env.XRPL_ESCROW_RELAY_URL) {
    throw new Error('Missing XRPL_ESCROW_RELAY_URL');
  }
  return process.env.XRPL_ESCROW_RELAY_URL;
}

async function callRelay(path, payload) {
  const base = requireRelayUrl();
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.XRPL_ESCROW_RELAY_TOKEN
        ? { authorization: `Bearer ${process.env.XRPL_ESCROW_RELAY_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EscrowRelayFailed:${res.status}:${text}`);
  }

  return res.json();
}

export async function createEscrow({ jobId, fromWallet, toWallet, amountXrp }) {
  if (XRPL_ESCROW_MODE === 'relay') {
    return callRelay('/escrow/create', { jobId, fromWallet, toWallet, amountXrp });
  }

  return {
    mode: 'mock',
    txHash: `MOCK_CREATE_${jobId}`,
    escrowSequence: `MOCK_SEQ_${jobId}`,
    ledgerIndex: Date.now(),
  };
}

export async function finishEscrow({ jobId, toWallet, escrowSequence }) {
  if (XRPL_ESCROW_MODE === 'relay') {
    return callRelay('/escrow/finish', { jobId, toWallet, escrowSequence });
  }

  return {
    mode: 'mock',
    txHash: `MOCK_FINISH_${jobId}`,
    ledgerIndex: Date.now(),
  };
}

export async function cancelEscrow({ jobId, fromWallet, escrowSequence }) {
  if (XRPL_ESCROW_MODE === 'relay') {
    return callRelay('/escrow/cancel', { jobId, fromWallet, escrowSequence });
  }

  return {
    mode: 'mock',
    txHash: `MOCK_CANCEL_${jobId}`,
    ledgerIndex: Date.now(),
  };
}
