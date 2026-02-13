import { createSignPayload, getPayload } from './xummPayloads.js';

const XRPL_ESCROW_MODE = process.env.XRPL_ESCROW_MODE || 'xumm';
const XRPL_RPC_URL = process.env.XRPL_RPC_URL || 'https://s.altnet.rippletest.net:51234';
const ESCROW_DURATION_SECONDS = Number(process.env.XRPL_ESCROW_DURATION_SECONDS || 60 * 60 * 24 * 3);
const ESCROW_CANCEL_GRACE_SECONDS = Number(process.env.XRPL_ESCROW_CANCEL_GRACE_SECONDS || 60 * 60 * 24 * 14);

function requireRelayUrl() {
  if (!process.env.XRPL_ESCROW_RELAY_URL) throw new Error('Missing XRPL_ESCROW_RELAY_URL');
  return process.env.XRPL_ESCROW_RELAY_URL;
}

function xrpToDrops(amountXrp) {
  return String(Math.round(Number(amountXrp) * 1_000_000));
}

function rippleTimeFromNow(seconds) {
  // Ripple epoch starts at 2000-01-01
  const rippleEpochOffsetMs = 946684800000;
  return Math.floor((Date.now() + seconds * 1000 - rippleEpochOffsetMs) / 1000);
}

async function callRelay(path, payload) {
  const res = await fetch(`${requireRelayUrl()}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.XRPL_ESCROW_RELAY_TOKEN ? { authorization: `Bearer ${process.env.XRPL_ESCROW_RELAY_TOKEN}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`EscrowRelayFailed:${res.status}:${await res.text()}`);
  return res.json();
}

export async function createEscrow({ jobId, fromWallet, toWallet, amountXrp }) {
  if (XRPL_ESCROW_MODE === 'relay') return callRelay('/escrow/create', { jobId, fromWallet, toWallet, amountXrp });

  const finishAfter = rippleTimeFromNow(ESCROW_DURATION_SECONDS);
  const cancelAfter = rippleTimeFromNow(ESCROW_CANCEL_GRACE_SECONDS);
  const payload = await createSignPayload({
    TransactionType: 'EscrowCreate',
    Account: fromWallet,
    Destination: toWallet,
    Amount: xrpToDrops(amountXrp),
    FinishAfter: finishAfter,
    CancelAfter: cancelAfter,
    Memos: [{ Memo: { MemoData: Buffer.from(`PaiKey job:${jobId}`).toString('hex').toUpperCase() } }],
  });

  return { action: 'signature_required', uuid: payload.uuid, signUrl: payload.signUrl, finishAfter, cancelAfter };
}

export async function finishEscrow({ jobId, fromWallet, escrowOwner, escrowSequence }) {
  if (XRPL_ESCROW_MODE === 'relay') return callRelay('/escrow/finish', { jobId, fromWallet, escrowOwner, escrowSequence });

  const payload = await createSignPayload({
    TransactionType: 'EscrowFinish',
    Account: fromWallet,
    Owner: escrowOwner,
    OfferSequence: Number(escrowSequence),
    Memos: [{ Memo: { MemoData: Buffer.from(`PaiKey release job:${jobId}`).toString('hex').toUpperCase() } }],
  });

  return { action: 'signature_required', uuid: payload.uuid, signUrl: payload.signUrl };
}

export async function cancelEscrow({ jobId, fromWallet, escrowOwner, escrowSequence }) {
  if (XRPL_ESCROW_MODE === 'relay') return callRelay('/escrow/cancel', { jobId, fromWallet, escrowOwner, escrowSequence });

  const payload = await createSignPayload({
    TransactionType: 'EscrowCancel',
    Account: fromWallet,
    Owner: escrowOwner,
    OfferSequence: Number(escrowSequence),
    Memos: [{ Memo: { MemoData: Buffer.from(`PaiKey refund job:${jobId}`).toString('hex').toUpperCase() } }],
  });

  return { action: 'signature_required', uuid: payload.uuid, signUrl: payload.signUrl };
}

export async function getPayloadStatus(uuid) {
  return getPayload(uuid);
}

export async function lookupTransaction(txid) {
  const res = await fetch(XRPL_RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ method: 'tx', params: [{ transaction: txid }] }),
  });
  if (!res.ok) throw new Error(`XrplTxLookupFailed:${res.status}:${await res.text()}`);
  const payload = await res.json();
  const result = payload?.result;
  if (!result) throw new Error('XrplTxLookupMissingResult');
  return result;
}
