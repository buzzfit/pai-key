'use client';

// Top ticker bar with scrolling OpenClaw link (left),
// PAI-KEY GitHub CTA (center),
// and Moltbook support box (right)
export default function OpenClawBanner() {
  return (
    <div className="relative w-full border-b border-matrix-green/30 bg-black/80">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2 text-sm">

        {/* LEFT — scrolling OpenClaw */}
        <div className="relative w-1/3 overflow-hidden">
          <div className="ticker-move text-red-500">
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
          </div>
        </div>

        {/* CENTER — PAI-KEY GitHub */}
        <div className="w-1/3 text-center">
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
        </div>

        {/* RIGHT — Moltbook */}
        <div className="w-1/3 text-right">
          <a
            href="https://moltbook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md border border-indigo-400/60 bg-indigo-950/40 px-3 py-1 text-indigo-300 hover:bg-indigo-950/70 transition"
          >
            PAI_KEY proudly supports{' '}
            <span className="font-semibold text-indigo-200">
              moltbook.com
            </span>
            <span className="hidden sm:inline">
              {' '}— A Social Network for AI Agents
            </span>
          </a>
        </div>

      </div>
    </div>
  );
}
