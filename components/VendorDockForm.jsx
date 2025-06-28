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

const PROOF_TYPES = [
  { value: 'any', label: 'Any (vendor decides)' },
  { value: 'file_hash', label: 'File Hash (SHA-256)' },
  { value: 'image_hash', label: 'Image / Video Hash' },
  { value: 'git_commit', label: 'Git Commit Hash' },
  { value: 'sensor_log', label: 'Sensor Log Hash' },
  { value: 'onchain_tx', label: 'On-chain Tx Hash' },
  { value: 'url_sig', label: 'URL + Signature' },
];

export default function VendorDockForm({ onSubmit, onClose, onConnectWallet }) {
  const [agentType, setAgentType] = useState('');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [capabilities, setCapabilities] = useState(''); // comma‑separated list
  const [hourlyRate, setHourlyRate] = useState('');
  const [minHours, setMinHours] = useState('1');
  const [acceptedProof, setAcceptedProof] = useState(['any']);
  const [xrpAddress, setXrpAddress] = useState('');

  function handleProofChange(value) {
    if (value === 'any') {
      setAcceptedProof(['any']);
      return;
    }
    const next = acceptedProof.includes(value)
      ? acceptedProof.filter(v => v !== value)
      : [...acceptedProof.filter(v => v !== 'any'), value];
    setAcceptedProof(next);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      agentType,
      name,
      tagline,
      description,
      capabilities: capabilities.split(',').map(s => s.trim()).filter(Boolean),
      hourlyRate,
      minHours,
      acceptedProof,
      xrpAddress,
    });
  }

  async function connectWallet() {
    if (onConnectWallet) {
      const address = await onConnectWallet();
      if (address) setXrpAddress(address);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dock Your Agent</h2>

        {/* Agent type */}
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

        {/* Name & tagline */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Agent Name</span>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Tagline</span>
            <input
              required
              maxLength={80}
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
        </div>

        {/* Description */}
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Detailed Description</span>
          <textarea
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          />
        </label>

        {/* Capabilities */}
        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Capabilities / Keywords (comma‑separated)</span>
          <input
            value={capabilities}
            onChange={e => setCapabilities(e.target.value)}
            className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., navigation, lidar, ride‑hailing"
          />
        </label>

        {/* Pricing */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Hourly Rate (XRP)</span>
            <input
              required
              type="number"
              min="0.000001"
              step="0.000001"
              value={hourlyRate}
              onChange={e => setHourlyRate(e.target.value)}
              className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Minimum Billable Hours</span>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={minHours}
              onChange={e => setMinHours(e.target.value)}
              className="mt-1 block w-full rounded border p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
        </div>

        {/* Proof types */}
        <fieldset className="block">
          <span className="text-gray-700 dark:text-gray-300">Accepted Proof Types</span>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {PROOF_TYPES.map(opt => (
              <label key={opt.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={acceptedProof.includes(opt.value)}
                  onChange={() => handleProofChange(opt.value)}
                  className="h-4 w-4"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Wallet connect */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={connectWallet}
            className="rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
          >
            {xrpAddress ? 'Wallet Connected' : 'Connect Xumm Wallet'}
          </button>
          {xrpAddress && (
            <span className="truncate text-xs text-gray-600 dark:text-gray-300">{xrpAddress}</span>
          )}
        </div>

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
            disabled={!xrpAddress}
            className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
