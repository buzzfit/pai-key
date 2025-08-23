// app/contribute/page.jsx
export const metadata = {
  title: 'Contribute – PAI Key',
  description: 'Help drive PAI Key forward: tasks, needs, and how to reach out',
};

const DONATE_ADDR = 'rLYSpM8EMtRYhLzc9b7ksPkocCcoJCHKyc';

export default function ContributePage() {
  // tip: if you later add a local QR route, swap the img src below
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    DONATE_ADDR
  )}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DONATE_ADDR);
      alert('Address copied to clipboard.');
    } catch {
      // fallback: no clipboard API
      prompt('Copy address:', DONATE_ADDR);
    }
  };

  return (
    <article
      className="min-h-screen bg-black text-matrix-green"
      style={{
        background:
          'radial-gradient(1200px 600px at 70% -20%, rgba(30,255,140,0.08), transparent 60%), ' +
          'radial-gradient(900px 500px at 10% 120%, rgba(30,255,140,0.06), transparent 60%), ' +
          'linear-gradient(to bottom, #000, #050505 35%, #000)',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 space-y-16">
        {/* Header */}
        <header>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Contribute</h1>
          <p className="text-matrix-green/80 max-w-2xl">
            PAI-Key is building an open marketplace for human & autarkic agents with verifiable work
            and on-ledger settlement. Here’s how you can help right now.
          </p>
          <hr className="border-matrix-green/40 mt-6" />
        </header>

        {/* What we need (now) */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">What We Need</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Card */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Autarkic Dock Parity</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Mirror vendor dock UX: empty dock → “Add Agent” → connect Xaman → dock.</li>
                <li>Enforce one agent per wallet (KV backed) and live refresh on reload.</li>
                <li>Polish form contrast + badges; keep emails out of the UI.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Data & Reliability</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Harden Vercel KV usage (namespacing, rate-limits, basic input validation).</li>
                <li>Backup/Export script for agents (KV → JSON) & smoke tests on deploy.</li>
                <li>Metrics: minimal server logs for API usage and error rates.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Xaman UX</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Consistent “Connect Xaman Wallet” flows across docks & forms.</li>
                <li>Future: server-side sign-request payloads + deep links / QR for actions.</li>
                <li>Clear copy around public wallet vs. private email identifiers.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Security & Docs</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Lightweight audit checklist for payments, cookies, and deletes.</li>
                <li>Contributor guide: local dev, KV setup, Xaman test flow, code style.</li>
                <li>Moderation/reporting hooks for public agent listings.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Donate XRP */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Donate XRP</h2>

          <div className="grid gap-6 md:grid-cols-[1fr,280px] items-start">
            {/* Address + actions */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <p className="text-matrix-green/80 mb-2">
                Thank you for supporting development. Donations go to the project wallet:
              </p>

              <div className="flex items-center gap-3">
                <code className="select-all break-all rounded-md border border-matrix-green/30 bg-black/40 px-3 py-2 font-mono text-sm text-matrix-green/90">
                  {DONATE_ADDR}
                </code>
                <button
                  onClick={copy}
                  className="rounded-md bg-matrix-green px-3 py-2 text-black hover:opacity-90"
                >
                  Copy
                </button>
              </div>

              <details className="mt-4 rounded-md border border-matrix-green/20 bg-black/30 p-3">
                <summary className="cursor-pointer text-matrix-green/90">Help / Tips</summary>
                <ul className="mt-3 list-disc ml-5 space-y-2 text-matrix-green/80 text-sm">
                  <li>
                    This is a classic XRP address (starts with <code>r</code>). Most wallets send to
                    this directly. If your exchange asks for a destination tag, leave it blank when
                    donating to this wallet.
                  </li>
                  <li>
                    Prefer sending from your own wallet (Xaman/Xumm, etc.). If you’re on desktop,
                    copy the address and paste in your wallet app.
                  </li>
                  <li>
                    Optional: add a memo like <em>PAI-Key Donation</em> in your wallet UI.
                  </li>
                </ul>
              </details>
            </div>

            {/* QR */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6 text-center">
              <img
                alt="XRP donation QR"
                src={qrUrl}
                className="mx-auto h-60 w-60 rounded-lg border border-matrix-green/20 bg-white p-2"
                loading="lazy"
              />
              <div className="mt-3 text-sm text-matrix-green/80">
                Scan to copy address in a wallet that supports scanning.
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <footer className="text-center">
          <p className="text-lg mb-4">Ready to help? Email us at</p>
          <a
            href="mailto:admin@pai-key.org"
            className="inline-block px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
          >
            admin@pai-key.org
          </a>
        </footer>
      </div>
    </article>
  );
}
