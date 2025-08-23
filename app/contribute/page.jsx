// app/contribute/page.jsx
import DonateXrpCard from '../../components/DonateXrpCard';

export const metadata = {
  title: 'Contribute – PAI Key',
  description: 'Help drive PAI Key forward: tasks, needs, and how to reach out',
};

const DONATE_ADDR = 'rLYSpM8EMtRYhLzc9b7ksPkocCcoJCHKyc';

export default function ContributePage() {
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

        {/* What we need */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">What We Need</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Autarkic Dock Parity</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Mirror vendor dock UX: empty dock → “Add Agent” → connect Xaman → dock.</li>
                <li>Enforce one agent per wallet (KV-backed) and keep agents on refresh.</li>
                <li>Polish form contrast & badges; keep emails out of the UI.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Data & Reliability</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Harden Vercel KV (namespacing, input validation, simple rate limits).</li>
                <li>Backup/export script (KV → JSON) and smoke tests on deploy.</li>
                <li>Minimal API metrics for usage & error rates.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Xaman UX</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Consistent “Connect Xaman Wallet” across docks & forms.</li>
                <li>Later: server-side sign-request payloads + deep links / QR for actions.</li>
                <li>Clear copy: public wallet vs. private email identifiers.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Security & Docs</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Light audit checklist for payments, cookies, deletes.</li>
                <li>Contributor guide: local dev, KV setup, Xaman test flow, code style.</li>
                <li>Moderation/reporting hooks for public agent listings.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Donate XRP */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Donate XRP</h2>
          <DonateXrpCard addr={DONATE_ADDR} />
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
