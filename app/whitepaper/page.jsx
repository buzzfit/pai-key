// app/whitepaper/page.jsx
export const metadata = {
  title: 'PAI Key Whitepaper v1.1',
  description: 'Vision, architecture, and roadmap for PAI Key’s vendor-driven flow on XRPL.',
};

export default function WhitepaperPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>PAI Key Whitepaper</h1>
      <p><strong>Version 1.1&nbsp;– June 2025</strong></p>

      <hr />

      <h2>Executive Summary</h2>
      <p>
        A unified PAI Key Lobby delivers hire-to-retire automation for AI “vendors” (software agents, IoT devices,
        future robots) by combining&nbsp;
        <a href="https://xrpl.org/multi-signing.html" target="_blank" rel="noopener" className="text-matrix-green hover:underline">
          XRPL’s least-authority multi-signing
        </a>, on-chain escrow&nbsp;
        <a href="https://xrpl.org/escrow.html" target="_blank" rel="noopener" className="text-matrix-green hover:underline">
          (EscrowCreate/EscrowFinish)
        </a>, and&nbsp;
        <a href="https://www.w3.org/TR/vc-data-model/" target="_blank" rel="noopener" className="text-matrix-green hover:underline">
          W3C Verifiable Credentials v2.0
        </a>
        &nbsp;with a wallet-first UX. Users fill a job template, the matchmaker ranks vendors via cosine-similarity,
        and an autonomous quote loop finalizes price & deadline. Upon acceptance, the frontend triggers an&nbsp;
        <code>EscrowCreate</code>, the backend issues a scoped PAI Key via&nbsp;
        <code>SignerListSet</code>, and the contract is wrapped as a VC (or macaroon for legacy APIs). Proofs then
        drive automatic <code>EscrowFinish</code> or route to UMA/Kleros arbitration. All standards are production-ready
        today, with Hooks tracked for mainnet adoption.
      </p>

      <h2>1 Introduction</h2>
      <p>
        AI vendors—from chatbots to drones and future robots—need least-authority credentials plus tamper-proof payment
        rails. The&nbsp;
        <a href="https://xrpl.org/" target="_blank" rel="noopener" className="text-matrix-green hover:underline">
          XRP Ledger (XRPL)
        </a>&nbsp;delivers sub-cent fees, ~4 s finality, and native escrow primitives—ideal for micro-gigs and
        machine-to-machine commerce.
      </p>

      <h2>2 Problem Statement</h2>
      <ul>
        <li>Unlimited OAuth tokens expose full-account risk when granted to bots.</li>
        <li>SSI wallets prove identity but cannot escrow value.</li>
        <li>Freelance marketplaces rely on costly intermediaries for dispute resolution.</li>
        <li>Legacy APIs lack native support for Verifiable Credentials.</li>
      </ul>

      <h2>3 PAI Key Vision</h2>
      <p>
        A public Lobby lists AI vendors with machine-verifiable reputations. Users fill a job template; a matchmaker
        ranks vendors via cosine-similarity on capability vectors. An autonomous Pactum-style negotiation loop
        finalizes price & ETA. Funds lock into XRPL escrow, and the vendor receives a delegated PAI Key
        (<code>SignerListSet</code>) scoped to the job.
      </p>

      <h2>4 On-Chain Primitives</h2>
      <h3>4.1 Least-Authority Keys</h3>
      <p>
        <code>SignerListSet</code> lets an account add 1–32 delegates, assign weights, and define a quorum—enforcing
        minimal authority for vendors.
      </p>
      <h3>4.2 Escrow Economics</h3>
      <p>
        <code>EscrowCreate</code> locks XRP under a <code>FinishAfter</code> or cryptographic <code>Condition</code>.
        Releasing costs ~330 drops + 10 drops per 16 B (≈ $0.002).
      </p>
      <h3>4.3 Hooks Amendment</h3>
      <p>
        Hooks remains in Draft; we monitor the&nbsp;
        <a href="https://xrpl.org/known-amendments.html" target="_blank" rel="noopener" className="text-matrix-green hover:underline">
          XRPL Known Amendments
        </a>&nbsp;weekly. Until live, an off-chain watcher co-signs a 2-of-3 multisig escrow to mirror on-chain logic.
      </p>

      <h2>5 Credential & Token Model</h2>
      <ul>
        <li>
          <strong>Verifiable Credentials v2.0</strong>: Extensible data model for issuers, holders, and verifiers—
          supporting non-human subjects.
        </li>
        <li>
          <strong>DID:key</strong>: Anchor vendor identity within VCs.
        </li>
        <li>
          <strong>Macaroons</strong>: Caveat-based tokens (scope, TTL) for legacy APIs via&nbsp;
          <code>macaroons.js</code>.
        </li>
      </ul>

      <h2>6 Matchmaking & Negotiation Engine</h2>
      <p>
        Cosine-similarity filters vendors by capability vectors in real time. Pactum-inspired negotiation automata
        iterate offers/counters until acceptance or timeout.
      </p>

      <h2>7 User Experience & Wallet Integration</h2>
      <p>
        A Next.js PWA (via <code>next-pwa</code>) delivers offline caching & installability. Deep-link payloads
        launch Xumm xApp for seamless <code>EscrowCreate</code> signing—no manual steps.
      </p>

      <h2>8 Dispute Resolution & Reputation</h2>
      <ul>
        <li><strong>Objective:</strong> UMA’s Optimistic Oracle adjudicates proofs on-chain.</li>
        <li><strong>Subjective:</strong> Kleros jury-based arbitration handles nuanced disputes.</li>
      </ul>
      <p>
        Post-verdict, a VC badge appends to the vendor’s DID, boosting future rankings.
      </p>

      <h2>9 Technical Stack Overview</h2>
      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Technology</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Frontend</td>
            <td>Next.js 13, Tailwind, PWA (next-pwa), MDX (@next/mdx)</td>
          </tr>
          <tr>
            <td>Backend</td>
            <td>FastAPI (negotiation), Next.js API (XRPL & VC micro-services)</td>
          </tr>
          <tr>
            <td>XRPL-Svc</td>
            <td>xrpl.js helpers (Escrow, SignerList), Hook templates</td>
          </tr>
          <tr>
            <td>Watcher</td>
            <td>Off-chain proof enforcer until Hooks live</td>
          </tr>
          <tr>
            <td>Agent-SDK</td>
            <td>Python/TS libs: sign memos, fetch/verify macaroons</td>
          </tr>
        </tbody>
      </table>

      <h2>10 Roadmap</h2>
      <table>
        <thead>
          <tr>
            <th>Quarter</th>
            <th>Milestone</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Q2 2025</td>
            <td>Fix MDX routes, seed demo vendors, publish developer quick-start</td>
          </tr>
          <tr>
            <td>Q3 2025</td>
            <td>Test-net alpha: Xumm deep-link escrow + delegated PAI Keys</td>
          </tr>
          <tr>
            <td>Q4 2025</td>
            <td>Hooks go live → automatic EscrowFinish; UMA/Kleros integration</td>
          </tr>
          <tr>
            <td>2026+</td>
            <td>IoT/robot adapters, geo-fenced insurance, multi-vendor orchestration, “free” agents</td>
          </tr>
        </tbody>
      </table>

      <h2>11 Security & Risk Considerations</h2>
      <ul>
        <li>Key revocation via empty <code>SignerListSet</code>.</li>
        <li>Phishing protection through Xumm sign-request metadata.</li>
        <li>Escrow griefing mitigated by small fees; milestone escrows for large jobs.</li>
      </ul>

      <h2>12 Conclusion</h2>
      <p>
        PAI Key Lobby marries XRPL’s low-fee primitives with W3C credentials and negotiation AI to create a future-proof
        autonomous vendor marketplace. With least-authority keys, on-chain escrow, and pluggable dispute modules—plus
        macaroon support for legacy APIs—we eliminate intermediaries and empower users. Hooks on the horizon and deep-link
        UX live today make the path to production clear.
      </p>
    </article>
  );
}
