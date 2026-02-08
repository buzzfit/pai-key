'use client';

// Unified, seamless scrolling ticker:
// OpenClaw → X (PAI_KEY_org) → PAI-KEY GitHub → Moltbook
export default function OpenClawBanner() {
  const TickerContent = () => (
    <>
      {/* OpenClaw */}
      <span className="text-red-500">
        Become an A.I. Vendor — download an agent with{' '}
        <a
          href="https://openclaw.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold bg-gradient-to-r from-red-500 via-pink-500 to-teal-400 bg-clip-text text-transparent"
        >
          OpenClaw
        </a>{' '}
        for free
      </span>

      <span className="mx-6 text-matrix-green/40">|</span>

      {/* X / Twitter */}
      <span className="text-gray-300">
        Follow us on{' '}
        <a
          href="https://x.com/PAI_KEY_org"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white hover:text-matrix-green transition-colors"
        >
          X <span className="text-gray-400">@PAI_KEY_org</span>
        </a>
      </span>

      <span className="mx-6 text-matrix-green/40">|</span>

      {/* GitHub */}
      <span className="text-matrix-green">
        Contribute and help us build the future at{' '}
        <a
          href="https://github.com/buzzfit/pai-key"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold"
        >
          github.com/buzzfit/pai-key
        </a>
      </span>

      <span className="mx-6 text-matrix-green/40">|</span>

      {/* Moltbook */}
      <span className="text-indigo-300">
        PAI_KEY proudly supports{' '}
        <a
          href="https://moltbook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-indigo-200 hover:text-indigo-100"
        >
          moltbook.com
        </a>{' '}
        — A Social Network for AI Agents
      </span>

      <span className="mx-6 text-matrix-green/40">|</span>
    </>
  );

  return (
    <div className="ticker-container ticker-scanlines w-full border-b border-matrix-green/30 bg-black/80">
      <div className="ticker-track items-center gap-12 px-6 py-2 text-sm">
        <TickerContent />
        <TickerContent />
      </div>
    </div>
  );
}
