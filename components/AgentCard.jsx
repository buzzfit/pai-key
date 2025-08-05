// components/AgentCard.jsx      ← REPLACE ENTIRE FILE
'use client';

export default function AgentCard({
  id,
  wallet,
  name,
  tagline,
  description,
  hourlyRate,
  minHours,
  onRemove,
}) {
  return (
    <div className="space-y-1 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <div className="break-all text-sm text-matrix-green">{wallet}</div>

      <div className="mt-1 text-xl font-semibold">{name}</div>
      <div className="text-gray-300">{tagline}</div>

      <p className="line-clamp-3 text-sm text-gray-400">{description}</p>

      <div className="mt-2 text-sm text-gray-400">
        {hourlyRate} XRP/h · min&nbsp;{minHours}&nbsp;h
      </div>

      <button
        onClick={() => onRemove(id)}
        className="mt-3 rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600"
      >
        Disconnect
      </button>
    </div>
  );
}
