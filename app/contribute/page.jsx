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
        <h2 className="text-3xl font-semibold">What’s Next & What We Need</h2>
        <ul className="list-decimal list-inside text-lg space-y-6">
          <li>
            <span className="font-bold">Static Route Fixes:</span>  
            Ensure all `/features`, `/overview`, and `/whitepaper` paths resolve—no more 404s.  
            <span className="italic">Need:</span> MDX/Next.js routing expertise :contentReference[oaicite:0]{index=0}.
          </li>
          <li>
            <span className="font-bold">CI & Build Automation:</span>  
            Add GitHub Actions for linting, tests, and Vercel previews.  
            <span className="italic">Need:</span> YAML scripting & GitHub workflows :contentReference[oaicite:1]{index=1}.
          </li>
          <li>
            <span className="font-bold">Hooks Integration:</span>  
            Configure on-ledger Hooks once enabled—replace the off-chain watcher.  
            <span className="italic">Need:</span> XRPL Hooks knowledge & WebAssembly :contentReference[oaicite:2]{index=2}.
          </li>
          <li>
            <span className="font-bold">Reputation Feed Stub:</span>  
            Build JSON-driven demo agent list in `public/agents/demo.json`.  
            <span className="italic">Need:</span> Data modeling & Next.js API route :contentReference[oaicite:3]{index=3}.
          </li>
          <li>
            <span className="font-bold">Wallet Deep-Linking:</span>  
            Enhance Xumm integration for seamless EscrowCreate via xApp.  
            <span className="italic">Need:</span> Xumm SDK & URI payload design :contentReference[oaicite:4]{index=4}.
          </li>
          <li>
            <span className="font-bold">User Onboarding Guide:</span>  
            Write clear “Getting Started” docs—cover install, dev, deploy.  
            <span className="italic">Need:</span> MDX writing & UX copy best practices .
          </li>
          <li>
            <span className="font-bold">Security Audit Prep:</span>  
            Draft audit checklist for SignerList & Escrow flows.  
            <span className="italic">Need:</span> XRPL security expertise & audit frameworks :contentReference[oaicite:6]{index=6}.
          </li>
        </ul>
      </section>

      {/* Call to Action */}
      <footer className="text-center">
        <p className="text-lg mb-4">Ready to help? Email us at</p>
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

