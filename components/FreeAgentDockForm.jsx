// components/FreeAgentDockForm.jsx
'use client';
import { useState } from 'react';

const AGENT_TYPES = [
  { value: '', label: 'Select an agent type…' },
  { value: 'transportation',  label: 'Transportation Agent' },
  { value: 'delivery',        label: 'Delivery Agent' },
  { value: 'aerial_inspection', label: 'Aerial Inspection Agent' },
  { value: 'service_robot',   label: 'Service Robot' },
  { value: 'code_gen',        label: 'Code Gen Agent' },
  { value: 'data_analysis',   label: 'Data Analysis Agent' },
  { value: 'content_creation',label: 'Content Creation Agent' },
  { value: 'decision_support',label: 'Decision-Support Agent' },
  { value: 'customer_support',label: 'Customer Support Agent' },
];

const PROOF_OPTIONS = [
  { value: 'any',        label: 'Any (agent decides)' },
  { value: 'file_hash',  label: 'File Hash (SHA-256)' },
  { value: 'image_hash', label: 'Image / Video Hash' },
  { value: 'git_commit', label: 'Git Commit Hash' },
  { value: 'sensor_log', label: 'Sensor Log Hash' },
  { value: 'onchain_tx', label: 'On-chain Tx Hash' },
  { value: 'url_sig',    label: 'URL + Signature' },
];

export default function FreeAgentDockForm({ email, onSubmit, onClose, onConnectWallet }) {
  const [state, setState] = useState({
    agentType: '', name: '', tagline: '', description: '', capabilities: '',
    hourlyRate: '', proof: ['any'], xrpAddr: ''
  });
  const setField = (k, v) => setState(p => ({ ...p, [k]: v }));

  const filled = () =>
    state.agentType && state.name && state.tagline && state.description && state.capabilities;
  const canSubmit = filled() && state.xrpAddr;

  const toggleProof = v => {
    setState(prev => {
      let next = prev.proof;
      if (v === 'any') next = ['any'];
      else if (prev.proof.includes(v)) {
        next = prev.proof.filter(x => x !== v && x !== 'any');
        if (next.length === 0) next = ['any'];
      } else {
        next = [...prev.proof.filter(x => x !== 'any'), v];
      }
      return { ...prev, proof: next };
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!canSubmit) return;
    const { agentType, name, tagline, description, capabilities, hourlyRate, proof, xrpAddr } = state;
    onSubmit({
      email,
      agentType,
      name,
      tagline,
      description,
      capabilities: capabilities.split(',').map(s => s.trim()).filter(Boolean),
      hourlyRate: hourlyRate || '0',
      proof,
      xrpAddr,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto
                   rounded-lg border border-matrix-green/20 bg-gray-900 p-6 text-matrix-green"
      >
        {/* close */}
        <button
          type="button"
          aria-label="close"
          onClick={onClose}
          className="absolute right-3 top-3 text-lg text-matrix-green/70 hover:text-matrix-green"
        >×</button>

        <h2 className="text-xl font-semibold">Autarkic Agent Docking</h2>

        {/* email */}
        <label className="block">
          <span className="text-matrix-green/90">Email</span>
          <input
            type="email"
            value={email}
            readOnly
            className="mt-1 w-full rounded border border-matrix-green/30 bg-black/40 p-2 text-matrix-green/90"
          />
        </label>

        {/* agent type */}
        <label className="block">
          <span className="text-matrix-green/90">Agent Type</span>
          <select
            required
            value={state.agentType}
            onChange={e => setField('agentType', e.target.value)}
            className="mt-1 block w-full rounded border border-matrix-green/30 bg-black/40 p-2 text-matrix-green"
          >
            {AGENT_TYPES.map(o => (
              <option key={o.value} value={o.value} disabled={!o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        {/* name & tagline */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-matrix-green/90">Agent Name</span>
            <input
              required
              value={state.name}
              onChange={e => setField('name', e.target.value)}
              className="mt-1 w-full rounded border border-matrix-green/30 bg-black/40 p-2 text-matrix-green"
            />
          </label>
          <label className="block">
            <span className="text-matrix-green/90">Tagline</span>
            <input
              required
              maxLength={80}
              value={state.tagline}
              onChange={e => setField('tagline', e.target.value)}
              className="mt-1 w-full rounded border border-matrix-green/30 bg-black/40 p-2 text-matrix-green"
            />
          </label>
        </div>

        {/* description */}
        <label className="block">
          <span className="text-matrix-green/90">Detailed Description</span>
          <textarea
            required
            rows={4}
            value={state.description}
            onChange={e => setField('description', e.target.value)}
            className="mt-1 w-full rounded border border-matrix-green/30 bg-black/40 p-2 text-matrix-green"
          />
        </label>

        {/* capabilities */}
        <label className="block">
          <span className="text-matrix-green/90">Capabilities / keywords (comma-separated)</span>
          <input
            value={state.capabilities}
            onChange={e => setField('capabilities', e.target.value)}
            className="mt-1 w-full rounded border border-matrix-green/30 bg-black/40 p-2 text-matrix-green"
          />
        </label>

        {/* optional rate */}
        <label className="block">
          <span className="text-matrix-green/90">Hourly Rate (XRP) – optional</span>
          <input
            type="number"
            min="0" step="0.000001"
            value={state.hourlyRate}
            onChange={e => setField('hourlyRate', e.target.value)}
            className="mt-1 w-full rounded border border-matrix-green/30 bg-black/40 p-2 text-matrix-green"
          />
        </label>

        {/* proofs */}
        <fieldset>
          <span className="text-matrix-green/90">Accepted Proof Types</span>
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

        {/* wallet */}
        <button
          type="button"
          onClick={async () => {
            const addr = await (onConnectWallet?.() || '');
            if (addr) setField('xrpAddr', addr);
          }}
          className="rounded bg-matrix-green px-3 py-2 font-medium text-black hover:opacity-90"
        >
          {state.xrpAddr ? 'Wallet Connected' : 'Connect Xaman Wallet'}
        </button>

        {/* actions */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-matrix-green/30 px-4 py-2 text-matrix-green hover:bg-black/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`rounded px-4 py-2 text-black ${
              canSubmit ? 'bg-matrix-green hover:opacity-90' : 'bg-matrix-green/40 cursor-not-allowed'
            }`}
          >
            Dock Autarkic Agent
          </button>
        </div>
      </form>
    </div>
  );
}
