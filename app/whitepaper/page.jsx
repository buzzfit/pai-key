// app/whitepaper/page.jsx
export const metadata = {
  title: 'PAI Key Whitepaper',
  description: 'Detailed design, protocol, and roadmap of the PAI Key system'
};

export default function WhitepaperPage() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Title Section */}
        <h1 className="text-6xl font-extrabold text-gray-900 text-center mb-8">
          PAI Key Whitepaper
        </h1>

        {/* Problem Statement with divider */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">1  Problem Statement</h2>
          <hr className="border-gray-300 border-t-2 w-20 mx-auto mb-4" />
          <p>
            Human users want to hire autonomous AI agents (bots, LLM chains, IoT robots) to act on their behalf, but today there is <strong>no on-chain primitive</strong> that delegates limited signing rights <em>and</em> escrows payment under mutually-verifiable conditions. Existing marketplaces rely on custodial APIs or off-chain OAuth tokens, which can be phished, revoked, or over-spent.
          </p>
        </div>

        {/* Design Goals with divider */}
        <div className="bg-white p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">2  Design Goals</h2>
          <hr className="border-gray-300 border-t-2 w-20 mx-auto mb-4" />
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Permissioned delegation</strong>: AI agent can sign only the transactions the human allows.</li>
            <li><strong>Symmetric trust</strong>: funds are locked on-chain until the agent proves task completion.</li>
            <li><strong>No smart-contract bytecode</strong>: use XRPL’s native SignerList + Escrow primitives to avoid code-level exploits.</li>
            <li><strong>Low fees & speed</strong>: keep cost ≤ 20 drops and latency &lt; 10 s per hire cycle.</li>
            <li><strong>Composable</strong>: future Hooks can enforce binary proofs; UMA / Kleros can arbitrate subjective disputes.</li>
          </ul>
        </div>

        {/* Protocol Overview with divider */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">3  Protocol Overview</h2>
          <hr className="border-gray-300 border-t-2 w-20 mx-auto mb-4" />
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <strong>Mint PAI Key</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Human submits <code>SignerListSet</code> (agent weight = 1, quorum = 1).</li>
                <li>Simultaneously submits <code>EscrowCreate</code> locking N XRP to agent.</li>
              </ul>
            </li>
            <li><strong>Agent acts</strong> within delegated scope (spend limits, memos).</li>
            <li><strong>Proof</strong>: Hook or oracle attests to off-chain deliverable.</li>
            <li><strong>EscrowFinish</strong> (auto or human click).</li>
            <li><strong>Revoke / Rotate</strong>: Human can rotate signer list at any time.</li>
          </ol>
        </div>

        {/* Threat Model with shield icon and divider */}
        <div className="bg-white p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">4  Threat Model</h2>
          <div className="flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22l8-4V10l-8-4-8 4v8l8 4z" />
            </svg>
            <hr className="border-gray-300 border-t-2 flex-grow mx-2" />
          </div>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Threat</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Agent exceeds scope</td>
                <td className="border border-gray-300 px-4 py-2">XRPL enforces quorum 1 & spend limits (no own-key)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Human withholds funds</td>
                <td className="border border-gray-300 px-4 py-2">EscrowFinish can be triggered by on-chain proof or oracle ruling</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Fee starvation</td>
                <td className="border border-gray-300 px-4 py-2">Client library auto-fills dynamic fee; user can bump &gt; 10 drops</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Key compromise</td>
                <td className="border border-gray-300 px-4 py-2">Human rotates SignerList; emergency “freeze AI” script</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Roadmap with divider */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">5  Roadmap</h2>
          <hr className="border-gray-300 border-t-2 w-20 mx-auto mb-4" />
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Phase 0</strong> (complete): SignerList + Escrow POC on test-net.</li>
            <li><strong>Phase 1</strong> (Q3 2025): Hooks amendment live → on-chain WASM proofs.</li>
            <li><strong>Phase 2</strong>: Integrate UMA optimistic oracle for arbitrary payloads.</li>
            <li><strong>Phase 3</strong>: DID anchoring via XLS-40 for portable PAI Keys.</li>
          </ul>
        </div>

        {/* GitHub Source Link */}
        <div className="text-center mt-12">
          <a
            href="https://github.com/buzzfit/pai-key/blob/main/docs/WHITEPAPER.md"
            className="text-blue-600 hover:underline text-lg"
          >
            View full source on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
