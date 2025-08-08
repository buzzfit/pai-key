// components/AgentCard.jsx
'use client';

export default function AgentCard({
  id,
  wallet,
  name,
  tagline,
  description,
  hourlyRate,
  minHours,
  capabilities = [], // optional: string or array
  onRemove,          // expects to be called with id
}) {
  // Normalize capabilities to an array of strings
  const caps = Array.isArray(capabilities)
    ? capabilities
    : (capabilities || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-matrix-green/25
                 bg-gray-900/60 p-5 shadow-lg transition
                 hover:border-matrix-green/50 hover:shadow-matrix-green/20"
    >
      {/* subtle neon accent on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 blur transition group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(600px 120px at 80% 0%, rgba(30,255,140,0.12), transparent 40%)',
        }}
      />

      {/* wallet */}
      <div className="mb-2 break-all font-mono text-xs text-matrix-green/90">
        {wallet || '—'}
      </div>

      {/* header */}
      <div className="mb-1 text-xl font-semibold tracking-wide">{name}</div>
      {tagline && <div className="mb-2 text-sm text-gray-300">{tagline}</div>}

      {/* description */}
      {description && (
        <p className="mb-3 line-clamp-3 text-sm text-gray-400">{description}</p>
      )}

      {/* capability chips (optional) */}
      {caps.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {caps.slice(0, 6).map((c, i) => (
            <span
              key={i}
              className="rounded-full border border-matrix-green/30 bg-black/20
                         px-2 py-0.5 text-xs text-matrix-green/80"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-300">
          <span className="text-gray-400">Rate:</span> {hourlyRate} XRP/h
          <span className="mx-2 text-gray-500">•</span>
          <span className="text-gray-400">Min:</span> {minHours} h
        </div>

        <button
          onClick={() => onRemove?.(id)}
          className="rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5
                     text-sm text-gray-100 transition
                     hover:border-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
