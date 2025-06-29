// components/JobTemplateForm.jsx
'use client';

import { useState } from 'react';

/* preset agent categories */
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

/* proof options */
const PROOF_TYPES = [
  { value: '', label: 'Select a proof type…' },
  { value: 'file_hash',  label: 'File Hash (SHA-256)' },
  { value: 'image_hash', label: 'Image / Video Hash' },
  { value: 'git_commit', label: 'Git Commit Hash' },
  { value: 'sensor_log', label: 'Sensor Log Hash' },
  { value: 'onchain_tx', label: 'On-chain Tx Hash' },
  { value: 'url_sig',    label: 'URL + Signature' },
];

export default function JobTemplateForm({ onSubmit, onClose, onConnectWallet }) {
  const [agentType, setAgentType] = useState('');
  const [scope,     setScope]     = useState('');
  const [proofType, setProofType] = useState('');
  const [maxHours,  setMaxHours]  = useState('1');
  const [xrpAddr,   setXrpAddr]   = useState('');

  const allFilled =
    agentType && scope && proofType && Number(maxHours) >= 1 && xrpAddr;

  const handleSubmit = e => {
    e.preventDefault();
    if (!allFilled) return;
    onSubmit({ agentType, scope, proofType, maxHours, xrpAddr });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800"
      >
        <h2 className="text-xl font-semibold dark:text-gray-100">Create a Job</h2>

        {/* agent type */}
        <label className="block">
          <span className="dark:text-gray-300">Agent Type</span>
          <select
            required
            value={agentType}
            onChange={e => setAgentType(e.target.value)}
            className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-100"
          >
            {AGENT_TYPES.map(o => (
              <option key={o.value} value={o.value} disabled={!o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* task description */}
        <label className="block">
          <span className="dark:text-gray-300">Task Description</span>
          <textarea
            required
            value={scope}
            onChange={e => setScope(e.target.value)}
            className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-100"
            placeholder="What task do you need done?"
          />
        </label>

        {/* proof type */}
        <label className="block">
          <span className="dark:text-gray-300">Proof Type</span>
          <select
            required
            value={proofType}
            onChange={e => setProofType(e.target.value)}
            className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-100"
          >
            {PROOF_TYPES.map(o => (
              <option key={o.value} value={o.value} disabled={!o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* max hours */}
        <label className="block">
          <span className="dark:text-gray-300">Max Hours</span>
          <input
            required
            type="number"
            min="1"
            value={maxHours}
            onChange={e => setMaxHours(e.target.value)}
            className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-gray-100"
          />
        </label>

        {/* wallet connect */}
        <button
          type="button"
          onClick={async () => {
            const addr = await (onConnectWallet?.() || '');
            if (addr) setXrpAddr(addr);
          }}
          className="w-full rounded bg-blue-600 px-3 py-2 text-white"
        >
          {xrpAddr ? 'Wallet Connected' : 'Connect Xumm Wallet'}
        </button>

        {/* actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 dark:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!allFilled}
            className={`rounded px-4 py-2 ${
              allFilled
                ? 'bg-matrix-green'
                : 'bg-matrix-green/40 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
