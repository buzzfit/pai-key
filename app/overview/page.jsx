// app/overview/page.jsx
export const metadata = {
  title: 'Independent Research – PAI Key',
  description: 'In-depth analysis of PAI-KEY viability and technical architecture',
};

export default function OverviewPage() {
  return (
    <article className="min-h-screen bg-black text-matrix-green px-6 py-12 sm:px-12 sm:py-16 space-y-12">
      {/* Page Header */}
      <header>
        <h1 className="text-5xl font-extrabold mb-4">Independent Research</h1>
        <hr className="border-matrix-green opacity-50 mb-8" />
      </header>

      {/* Executive Summary */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Executive Summary</h2>
        <p className="text-lg leading-relaxed">
          This report analyzes the viability of the
          <span className="font-bold"> PAI-KEY</span> project, an open-source toolkit designed
          for minting and managing Proxy Access Identifier (PAI) keys on the XRP Ledger.
          PAI-KEY aims to facilitate secure interactions between humans and
          autonomous AI agents by enabling cryptographically enforced delegated
          signing, escrow-backed payments, and per-action on-ledger audit trails.
          The analysis indicates that the project leverages the inherent
          advantages of the XRP Ledger and aligns with the growing need for secure
          AI agent management. However, its early stage of development and reliance
          on evolving XRP Ledger features necessitate a cautious approach to investment.
        </p>
      </section>

      {/* Introduction */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Introduction</h2>
        <p className="text-lg leading-relaxed">
          The landscape of artificial intelligence is rapidly evolving, with AI
          agents transitioning from mere tools for content generation to
          autonomous entities capable of performing complex tasks. This increasing
          autonomy necessitates the development of robust management and security
          paradigms to govern their actions and ensure their responsible use.
        </p>
        <p className="text-lg leading-relaxed">
          Gartner projects that by 2028, a significant portion of enterprise
          applications will integrate agentic AI, and these agents will play a
          crucial role in daily business decisions. The potential for AI agents
          to streamline workflows and enhance productivity across various
          industries is immense.
        </p>
      </section>

      {/* Challenges in Decentralized Security */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Challenges in Decentralized Security</h2>
        <p className="text-lg leading-relaxed">
          Managing and securing autonomous AI agents on decentralized
          environments presents unique challenges. Traditional security measures,
          often designed for static applications and human users, may not be
          adequate for the dynamic and autonomous nature of AI agents.
        </p>
        <p className="text-lg leading-relaxed">
          These agents can expand the attack surface, operate independently, and
          potentially scale security failures rapidly. Ensuring accountability,
          controlling permissions, and maintaining compliance in a distributed
          setting without a central authority are critical concerns.
        </p>
      </section>

      {/* PAI-KEY Deep Dive */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">PAI-KEY Project Deep Dive</h2>
        <p className="text-lg leading-relaxed">
          At its core, PAI-KEY introduces Proxy Access Identifiers (PAIs)—
          cryptographically secured “power-of-attorney” keys for AI agents on the
          XRP Ledger. These keys grant scoped, time-limited signing authority,
          enabling agents to execute predefined tasks without full account control.
        </p>
        <p className="text-lg leading-relaxed">
          Leveraging SignerList transactions and low-fee escrow, PAI-KEY provides
          delegated signing, escrow-backed payments, and immutable audit trails,
          all recorded transparently on-ledger at fractions of a penny per action.
        </p>
      </section>

      {/* Architecture & Components */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Architecture & Core Components</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed space-y-2">
          <li>
            <span className="font-bold">lobby-frontend/:</span> Next.js PWA UI with Tailwind.
          </li>
          <li>
            <span className="font-bold">lobby-backend/:</span> FastAPI/Next API for matchmaking.
          </li>
          <li>
            <span className="font-bold">credential-svc/:</span> DID & VC issuance, macaroon minting.
          </li>
          <li>
            <span className="font-bold">xrpl-svc/:</span> Escrow & SignerList helpers, Hook configs.
          </li>
          <li>
            <span className="font-bold">watcher/:</span> Off-chain proof-enforcement shim.
          </li>
          <li>
            <span className="font-bold">agent-sdk/:</span> Python/TS libraries for memos & macaroons.
          </li>
          <li>
            <span className="font-bold">docs/:</span> MDX whitepaper & blog via Next App Router.
          </li>
          <li>
            <span className="font-bold">scripts/:</span> Test-net demos (issue_pai_key.py, agent_listener.py).
          </li>
        </ul>
      </section>

      {/* Conclusion */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Conclusion</h2>
        <p className="text-lg leading-relaxed">
          PAI-KEY harnesses the speed, low cost, and transparency of the XRP Ledger
          combined with W3C credential standards to offer a secure, scalable
          framework for autonomous AI agent management. Its “all-in-one key”
          approach simplifies identity, permissions, and escrow within single
          transactions—ready today with Hooks on the horizon.
        </p>
      </section>
    </article>
  );
}

