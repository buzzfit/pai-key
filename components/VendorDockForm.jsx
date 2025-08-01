// components/VendorDockForm.jsx
'use client';

import { useState, useEffect } from 'react';

/**
 * Stable version + cookie prefill:
 * - On mount, fetch(/api/me) to see if an XRPL account cookie exists.
 * - If present, set xrpAddr so the button shows "Wallet Connected".
 *
 * Uses Xumm "next.always" deep link (QR on desktop, deep-link on mobile).
 * Docs: https://xumm.readme.io/reference/post-payload
 */

const AGENT_TYPES = [
  { value: '', label: 'Select an agent type…' },
  { value: 'transportation', label: 'Transportation Agent' },
  { value: 'delivery', label: 'Delivery Agent' },
  { value: 'aerial_inspection', label: 'Aerial Inspection Agent' },
  { value: 'service_robot', label: 'Service Robot' },
  { value: 'code_gen', label: 'Code Gen Agent' },
  { value: 'data_analysis', label: 'Data Analysis Agent' },
  { value: 'content_creation', label: 'Content Creation Agent' },
  { value: 'decision_support', label: 'Decision‑Support Agent' },
  { value: 'customer_support', label: 'Customer Support Agent' },
];

const PROOF_OPTIONS = [
  { value: 'any',        label: 'Any (vendor decides)' },
  { value: 'file_hash',  label: 'File Hash (SHA‑256)' },
  { value: 'image_hash', label: 'Image / Video Hash' },
  { value: 'git_commit', label: 'Git Commit Hash' },
  { value: 'sensor_log', label: 'Sensor Log Hash' },
  { value: 'onchain_tx', label: 'On‑chain Tx Hash' },
  { value: 'url_sig',    label: 'URL + Signature' },
];

export default function VendorDockForm({ onSubmit, onClose, onConnectWallet }) {
  const [state, setState] = useState({
    agentType: '', name: '', tagline: '', description: '', capabilities: '',
    hourlyRate: '', minHours: '1', proof: ['any'], xrpAddr: ''
  });
  const setField = (k, v) => setState(prev => ({ ...prev, [k]: v }));

  // 🔹 Prefill from secure cookie (via /api/me)
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
        if (me?.account) setField('xrpAddr', me.account);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const allFilled = () => Object.entries(state).every(([k, v]) => {
    if (k === 'proof' || k === 'xrpAddr') return true;
    return Boolean(v);
  });
  const canSubmit = allFilled() && state.xrpAddr;

  const toggleProof = v => {
    setState(prev => {
      let nextProof;
      if (v === 'any') {
        nextProof = ['any'];
      } else if (prev.proof.includes(v)) {
        nextProof = prev.proof.filter(x => x !== v && x !== 'any');
        if (nextProof.length === 0) nextProof = ['any'];
      } else {
        nextProof = [...prev.proof.filter(x => x !== 'any'), v];
      }
      return { ...prev, proof: nextProof };
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!canSubmit) return;
    const { agentType, name, tagline, description, capabilities, hourlyRate, minHours, proof, xrpAddr } = state;
    onSubmit({
      agentType,
      name,
      tagline,
      description,
      capabilities: capabilities.split(',').map(s => s.trim()).filter(Boolean),
      hourlyRate,
      minHours,
      proof,
      xrpAddr,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 space-y-4 dark:bg-gray-800"
      >
        <button
          type="button"
          aria-label="close"
          onClick={onClose}
          className="absolute top-3 right-3 text-lg text-gray-500 hover:text-gray-700"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold">Dock Your Agent</h2>

        {/* agent type */}
        <label className="block">
          <span>Agent Type</span>
          <select
            required
            value={state.agentType}
            onChange={e => setField('agentType', e.target.value)}
            className="mt-1 block w-full rounded border p-2"
          >
            {AGENT_TYPES.map(o => (
              <option key={o.value} value={o.value} disabled={!o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* name + tagline */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span>Agent Name</span>
            <input
              required
              value={state.name}
              onChange={e => setField('name', e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="block">
            <span>Tagline</span>
            <input
              required
              maxLength={80}
              value={state.tagline}
              onChange={e => setField('tagline', e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
        </div>

        {/* description */}
        <label className="block">
          <span>Detailed Description</span>
          <textarea
            required
            rows={4}
            value={state.description}
            onChange={e => setField('description', e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>

        {/* capabilities */}
        <label className="block">
          <span>Capabilities / keywords (comma‑separated)</span>
          <input
            value={state.capabilities}
            onChange={e => setField('capabilities', e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>

        {/* pricing */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span>Hourly Rate (XRP)</span>
            <input
              required
              type="number"
              min="0.000001"
              step="0.000001"
              value={state.hourlyRate}
              onChange={e => setField('hourlyRate', e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
          <label className="block">
            <span>Minimum Billable Hours</span>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={state.minHours}
              onChange={e => setField('minHours', e.target.value)}
              className="mt-1 w-full rounded border p-2"
            />
          </label>
        </div>

        {/* proof types */}
        <fieldset>
          <span>Accepted Proof Types</span>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {PROOF_OPTIONS.map(o => (
              <label key={o.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.proof.includes(o.value)}
                  onChange={() => toggleProof(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* wallet connect */}
        <button
          type="button"
          onClick={async () => {
            const addr = await (onConnectWallet?.() || '');
            if (addr) setField('xrpAddr', addr);
          }}
          className="rounded bg-blue-600 px-3 py-2 text-white"
        >
          {state.xrpAddr ? 'Wallet Connected' : 'Connect Xumm Wallet'}
        </button>

        {/* actions */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`rounded px-4 py-2 ${
              canSubmit ? 'bg-matrix-green' : 'bg-matrix-green/40 cursor-not-allowed'
            }`}
          >
            Dock Agent
          </button>
        </div>
      </form>
    </div>
  );
}
