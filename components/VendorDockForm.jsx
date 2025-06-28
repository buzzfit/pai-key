// components/VendorDockForm.jsx
'use client';
import { useState } from 'react';

const AGENT_TYPES = [
  { value: '', label: 'Select an agent type…' },
  { value: 'transportation', label: 'Transportation Agent' },
  { value: 'delivery', label: 'Delivery Agent' },
  { value: 'aerial_inspection', label: 'Aerial Inspection Agent' },
  { value: 'service_robot', label: 'Service Robot' },
  { value: 'code_gen', label: 'Code Gen Agent' },
  { value: 'data_analysis', label: 'Data Analysis Agent' },
  { value: 'content_creation', label: 'Content Creation Agent' },
  { value: 'decision_support', label: 'Decision-Support Agent' },
  { value: 'customer_support', label: 'Customer Support Agent' },
];

const PROOF_OPTIONS = [
  { value: 'any',         label: 'Any (vendor decides)' },
  { value: 'file_hash',   label: 'File Hash (SHA-256)' },
  { value: 'image_hash',  label: 'Image / Video Hash' },
  { value: 'git_commit',  label: 'Git Commit Hash' },
  { value: 'sensor_log',  label: 'Sensor Log Hash' },
  { value: 'onchain_tx',  label: 'On-chain Tx Hash' },
  { value: 'url_sig',     label: 'URL + Signature' },
];

export default function VendorDockForm({ onSubmit, onClose, onConnectWallet }) {
  const [agentType,    setAgentType]    = useState('');
  const [name,         setName]         = useState('');
  const [tagline,      setTagline]      = useState('');
  const [description,  setDescription]  = useState('');
  const [capabilities, setCapabilities] = useState('');
  const [hourlyRate,   setHourlyRate]   = useState('');
  const [minHours,     setMinHours]     = useState('1');
  const [proof,        setProof]        = useState(['any']);
  const [xrpAddr,      setXrpAddr]      = useState('');

  const toggleProof = v => {
    if (v === 'any') { setProof(['any']); return; }
    setProof(p =>
      p.includes(v)
        ? p.filter(x => x !== v)
        : [...p.filter(x => x !== 'any'), v]
    );
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      agentType,
      name,
      tagline,
      description,
      capabilities: capabilities
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
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
        className="w-full max-w-xl space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800"
      >
        <h2 className="text-xl font-semibold">Dock Your Agent</h2>

        {/* Agent type */}
        <label className="block">
          <span>Agent Type</span>
          <select
            required
            value={agentType}
            onChange={e => setAgentType(e.target.value)}
            className="mt-1 block w-full rounded border p-2"
          >
            {AGENT_TYPES.map(o => (
              <option key={o.value} value={o.value} disabled={!o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* Name & tagline */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span>Agent Name</span>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full rounded border p-2"
            />
          </label>
          <label className="block">
            <span>Tagline</span>
            <input
              required
              maxLength={80}
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="mt-1 block w-full rounded border p-2"
            />
          </label>
        </div>

        {/* Description */}
        <label className="block">
          <span>Detailed Description</span>
          <textarea
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mt-1 block w-full rounded border p-2"
          />
        </label>

        {/* Capabilities */}
        <label className="block">
          <span>Capabilities / keywords (comma-separated)</span>
          <input
            value={capabilities}
            onChange={e => setCapabilities(e.target.value)}
            className="mt-1 block w-full rounded border p-2"
          />
        </label>

        {/* Pricing */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span>Hourly Rate (XRP)</span>
            <input
              required
              type="number"
              min="0.000001"
              step="0.000001"
              value={hourlyRate}
              onChange={e => setHourlyRate(e.target.value)}
              className="mt-1 block w-full rounded border p-2"
            />
          </label>
          <label className="block">
            <span>Minimum Billable Hours</span>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={minHours}
              onChange={e => setMinHours(e.target.value)}
              className="mt-1 block w-full rounded border p-2"
            />
          </label>
        </div>

        {/* Proof types */}
        <fieldset>
          <span>Accepted Proof Types</span>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {PROOF_OPTIONS.map(o => (
              <label key={o.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={proof.includes(o.value)}
                  onChange={() => toggleProof(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Wallet connect placeholder */}
        <button
          type="button"
          onClick={async () => {
            const addr = await (onConnectWallet?.() || '');
            if (addr) setXrpAddr(addr);
          }}
          className="rounded bg-blue-600 px-3 py-2 text-white"
        >
          {xrpAddr ? 'Wallet Connected' : 'Connect Xumm Wallet'}
        </button>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!xrpAddr}
            className="rounded bg-matrix-green px-4 py-2"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
