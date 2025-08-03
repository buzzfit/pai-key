// components/AgentCard.jsx
'use client';

export default function AgentCard({
  wallet,
  name,
  tagline,
  hourlyRate,
  minHours,
  onRemove,          // function to call when “Disconnect” is clicked
}) {
  return (
    <div className="rounded-lg border border-gray-700 p-4 space-y-1 bg-gray-900">
      {/* wallet address */}
      <div className="text-matrix-green break-all text-sm">{wallet}</div>

      {/* agent info */}
      <div className="text-xl font-semibold mt-1">{name}</div>
      <div className="text-gray-300">{tagline}</div>
      <div className="text-sm text-gray-400 mt-2">
        {hourlyRate} XRP/h · min&nbsp;{minHours} h
      </div>

      {/* per-card disconnect */}
      <button
        onClick={onRemove}
        className="mt-3 rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600"
      >
        Disconnect
      </button>
    </div>
  );
}
