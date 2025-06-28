// components/JobTemplateForm.jsx
'use client';

import { useState } from 'react';

// Preset agent categories (mirrors vendor‑side form)
const AGENT_TYPES = [
  { value: '', label: 'Select an agent type…' },
  { value: 'transportation', label: 'Transportation Agent' },
  { value: 'delivery', label: 'Delivery Agent' },
  { value: 'aerial_inspection', label: 'Aerial Inspection Agent' },
  { value: 'service_robot', label: 'Service Robot' },
  { value: 'code_gen', label: 'Code Gen Agent' },
  { value: 'data_analysis', label: 'Data Analysis Agent' },
  { value: 'content_creation', label: 'Content Creation Agent' },
  { value: 'decision_support', label: 'Decision‑Support Agent' },
  { value: 'customer_support', label: 'Customer Support Agent' },
];

// Proof‑of‑completion options
const PROOF_TYPES = [
  { value: '', label: 'Select a proof type…' },
  { value: 'file_hash', label: 'File Hash (SHA‑256)' },
  { value: 'image_hash', label: 'Image / Video Hash' },
  { value: 'git_commit', label: 'Git Commit Hash' },
  { value: 'sensor_log', label: 'Sensor Log Hash' },
  { value: 'onchain_tx', label: 'On‑chain Tx Hash' },
  { value: 'url_sig', label: 'URL + Signature' },
];

export default function JobTemplateForm({ onSubmit, onClose }) {
  const [agentType, setAgentType] = useState('');
  const [scope, setScope] = useState('');
  const [proofType, setProofType] = useState('');
  const [maxHours, setMaxHours] = useState('1');

  function handleSubmit(e) {
    e.preventDefault();
    // propagate data upward; parent handles API / validation
    onSubmit({ agentType, scope, proofType, maxHours });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create a Job</h2>

        {/* Agent type selector */}
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Agent Type</span>
          <select
            required
            value={agentType}
            onChange={e => setAgentType(e.target.value)}
            className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          >
            {AGENT_TYPES.map(opt => (
              <option key={opt.value} value={opt.value} disabled={!opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* Task description */}
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Task Description</span>
          <textarea
            required
            value={scope}
            onChange={e => setScope(e.target.value)}
            className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            placeholder="What task do you need done?"
          />
        </label>

        {/* Proof type selector */}
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Proof Type</span>
          <select
            required
            value={proofType}
            onChange={e => setProofType(e.target.value)}
            className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          >
            {PROOF_TYPES.map(opt => (
              <option key={opt.value} value={opt.value} disabled={!opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* Max hours */}
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Max Hours</span>
          <input
            required
            type="number"
            min="1"
            step="1"
            value={maxHours}
            onChange={e => setMaxHours(e.target.value)}
            className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          />
        </label>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
