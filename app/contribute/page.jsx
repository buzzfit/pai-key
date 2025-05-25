// app/contribute/page.jsx
export const metadata = {
  title: 'Contribute – PAI Key',
  description: 'Help drive PAI Key forward: tasks, needs, and how to reach out',
};

export default function ContributePage() {
  return (
    <article className="min-h-screen bg-black text-matrix-green px-6 py-12 sm:px-12 space-y-12">
      {/* Header */}
      <header>
        <h1 className="text-5xl font-extrabold mb-4">Contribute</h1>
        <hr className="border-matrix-green opacity-50 mb-8" />
      </header>

      {/* Roadmap List */}
      <section className="space-y-8">
        <h2 className="text-3xl font-semibold">What’s Next &amp; What We Need</h2>
        <ul className="list-decimal list-inside text-lg leading-relaxed space-y-6">
          <li>
            <span className="font-bold">Static Route Fixes:</span><br/>
            Ensure `/features`, `/overview`, and `/whitepaper` paths resolve—no more 404s.<br/>
            <span className="italic">Needed:</span> MDX/Next.js routing expertise.
          </li>
          <li>
            <span className="font-bold">CI &amp; Build Automation:</span><br/>
            Add GitHub Actions for linting, tests, and preview deployments.<br/>
            <span className="italic">Needed:</span> YAML scripting &amp; GitHub workflows.
          </li>
          <li>
            <span className="font-bold">Hooks Integration:</span><br/>
            Configure on-ledger Hooks once enabled—phase out the off-chain watcher.<br/>
            <span className="italic">Needed:</span> XRPL Hooks knowledge &amp; WebAssembly.
          </li>
          <li>
            <span className="font-bold">Reputation Feed Stub:</span><br/>
            Build a JSON-driven demo agent list at `public/agents/demo.json`.<br/>
            <span className="italic">Needed:</span> Data modeling &amp; Next.js API route.
          </li>
          <li>
            <span className="font-bold">Wallet Deep-Linking:</span><br/>
            Enhance Xumm integration for seamless EscrowCreate via xApp.<br/>
            <span className="italic">Needed:</span> Xumm SDK &amp; URI payload design.
          </li>
          <li>
            <span className="font-bold">Onboarding Guide:</span><br/>
            Write “Getting Started” docs—cover install, dev, and deploy steps.<br/>
            <span className="italic">Needed:</span> MDX writing &amp; UX copy best practices.
          </li>
          <li>
            <span className="font-bold">Security Audit Prep:</span><br/>
            Draft an audit checklist for SignerList &amp; Escrow flows.<br/>
            <span className="italic">Needed:</span> XRPL security expertise &amp; audit frameworks.
          </li>
        </ul>
      </section>

      {/* Call to Action */}
      <footer className="text-center">
        <p className="text-lg mb-4">
          Ready to help? Email us at
        </p>
        <a
          href="mailto:admin@pai-key.org"
          className="inline-block px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
        >
          admin@pai-key.org
        </a>
      </footer>
    </article>
  );
}
