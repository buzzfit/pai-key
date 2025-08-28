// app/contribute/page.jsx
import DonateXrpCard from '../../components/DonateXrpCard';

export const metadata = {
  title: 'Contribute – PAI Key',
  description: 'Help drive PAI Key forward: tasks, roadmap, and how to reach out',
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
        <header className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight">Contribute</h1>
          <p className="text-matrix-green/80 max-w-3xl">
            PAI-Key is building a lean, verifiable marketplace where humans and autarkic agents
            work together, settle on XRPL, and prove results. You can help us ship the
            end-to-end demo (hire → escrow → proofs) by picking up scoped tasks below.
          </p>
          <hr className="border-matrix-green/40" />
        </header>

        {/* Roadmap-aligned needs */}
        <section className="space-y-8">
          <h2 className="text-3xl font-semibold">Help Us Ship the Demo</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Phase A */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Phase A — Stabilize & Flag</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Add <code>feature:beta_jobs</code> (Edge Config helper) and gate new UI.</li>
                <li>Lobby “Create Job” wizard scaffold (no on-chain yet).</li>
                <li>Skeleton/empty/error states across docks & lobby.</li>
              </ul>
            </div>

            {/* Phase B */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Phase B — Minimal Job Model</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>KV: <code>job:&#123;id&#125;</code>, <code>jobs:byCreator</code>, <code>jobs:byAgent</code>.</li>
                <li>API: <code>POST /api/jobs</code>, <code>GET/PATCH /api/jobs/:id</code>.</li>
                <li>UI: job details page; show estimated cost (rate × hours).</li>
              </ul>
            </div>

            {/* Phase C */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Phase C — XRPL Escrow (Happy Path)</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Xaman deep-link for <code>EscrowCreate</code>; store <code>escrow_tx</code>.</li>
                <li>Simple tx polling for confirmation (no webhooks yet).</li>
                <li>UI: funded state, release/cancel buttons (guarded by rules).</li>
              </ul>
            </div>

            {/* Phase D */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Phase D — Proofs MVP (Hashes Only)</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>KV: <code>proof:&#123;id&#125;</code>, <code>proofs:byJob</code> (hash + optional URI).</li>
                <li>Client hashing (SHA-256), no file storage.</li>
                <li>UI: submit/preview proofs on the job page.</li>
              </ul>
            </div>

            {/* Phase E */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Phase E — Release/Cancel & Reputation</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li><code>EscrowFinish</code>/<code>EscrowCancel</code> flows via Xaman.</li>
                <li>Increment <code>completed_jobs</code>, optional star rating modal.</li>
                <li>Lobby sort: recency → completions (keep origin badges).</li>
              </ul>
            </div>

            {/* Phase F */}
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-xl font-semibold mb-2">Phase F — Demo Polish & Docs</h3>
              <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
                <li>Seed data, smoke tests, contributor quick-start.</li>
                <li>Accessibility and contrast passes.</li>
                <li>Flip the flag when demo is green.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Good First Issues */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Good First Issues</h2>
          <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
            <ul className="list-disc ml-5 space-y-2 text-matrix-green/90">
              <li>Edge Config helper: <code>isJobsEnabled()</code> + React hook.</li>
              <li>Skeleton cards for lobby/docks (loading shimmer).</li>
              <li>KV backup/export CLI (dump to JSON).</li>
              <li>Client SHA-256 helper (browser file → hex) + unit test.</li>
              <li>XRPL drops↔XRP utils & formatted cost component.</li>
            </ul>
          </div>
        </section>

        {/* Open Roles */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Open Roles (Volunteer or Grant-Funded)</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-lg font-semibold mb-2">XRPL Engineer</h3>
              <p className="text-matrix-green/80">
                EscrowCreate/Finish/Cancel builders, Xaman deep-links, demo-grade polling.
              </p>
            </div>
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-lg font-semibold mb-2">Frontend (Next.js)</h3>
              <p className="text-matrix-green/80">
                Wizard UX, job detail, proofs UI, skeleton/empty states, accessibility.
              </p>
            </div>
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              <h3 className="text-lg font-semibold mb-2">DevEx & Docs</h3>
              <p className="text-matrix-green/80">
                Contributor guide, KV keys reference, seed scripts, smoke tests.
              </p>
            </div>
          </div>
        </section>

        {/* Donate XRP (QR stays functional via DonateXrpCard) */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Donate XRP</h2>
          <DonateXrpCard addr={DONATE_ADDR} />
        </section>

        {/* Contact */}
        <footer className="text-center">
          <p className="text-lg mb-4">Want to help or sponsor a phase? Contact us:</p>
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
