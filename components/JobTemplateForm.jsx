'use client';

import { useState } from 'react';

export default function JobTemplateForm({ onSubmit, onClose }) {
  const [scope, setScope] = useState('');
  const [proofRule, setProofRule] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [budget, setBudget] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    // pass values up; parent will handle API calls
    onSubmit({ scope, proofRule, maxTime, budget });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Create a Job
        </h2>

        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Scope</span>
          <textarea
            required
            value={scope}
            onChange={e => setScope(e.target.value)}
            className="mt-1 block w-full border rounded p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            placeholder="What task do you need done?"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Proof Rule</span>
          <input
            required
            type="text"
            value={proofRule}
            onChange={e => setProofRule(e.target.value)}
            className="mt-1 block w-full border rounded p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
            placeholder="E.g., SHA-256 hash of deliverable"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Max Time (minutes)</span>
          <input
            required
            type="number"
            min="1"
            value={maxTime}
            onChange={e => setMaxTime(e.target.value)}
            className="mt-1 block w-full border rounded p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 dark:text-gray-300">Budget (XRP)</span>
          <input
            required
            type="number"
            min="0.000001"
            step="0.000001"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="mt-1 block w-full border rounded p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          />
        </label>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-matrix-green text-black rounded hover:opacity-90"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
