'use client';

// Unified scrolling ticker bar:
// OpenClaw → PAI-KEY GitHub → Moltbook
// Scrolls as one continuous stream and pauses on hover
export default function OpenClawBanner() {
  return (
    <div className="ticker-container relative w-full overflow-hidden border-b border-matrix-green/30 bg-black/80">
      <div className="ticker-track flex items-center gap-16 px-6 py-2 text-sm">

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

        {/* Divider */}
        <span className="text-matrix-green/40">|</span>

        {/* PAI-KEY GitHub */}
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

        {/* Divider */}
        <span className="text-matrix-green/40">|</span>

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

      </div>
    </div>
  );
}
