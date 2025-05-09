// app/whitepaper/page.jsx
export const metadata = {
  title: 'PAI Key Whitepaper',
  description: 'Detailed design, protocol, and roadmap of the PAI Key system'
};

export default function WhitepaperPage() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Title Section */}
        <h1 className="text-6xl font-extrabold text-gray-900 mb-8 text-center">
          PAI Key Whitepaper
        </h1>

        {/* Content Section */}
        <article className="prose prose-xl lg:prose-2xl dark:prose-invert">
          <h2>1  Problem Statement</h2>
          <p>
            Human users want to hire autonomous AI agents (bots, LLM chains, IoT robots) to act on their behalf,
            but today there is <strong>no on-chain primitive</strong> that delegates limited signing rights <em>and</em>
            escrows payment under mutually-verifiable conditions. Existing marketplaces rely on custodial APIs or
            off-chain OAuth tokens, which can be phished, revoked, or over-spent.
          </p>

          <h2>2  Design Goals</h2>
          <ul>
            <li><strong>Permissioned delegation</strong>: AI agent can sign only the transactions the human allows.</li>
            <li><strong>Symmetric trust</strong>: funds are locked on-chain until the agent proves task completion.</li>
            <li><strong>No smart-contract bytecode</strong>: use XRPL’s native SignerList + Escrow primitives to avoid code-level exploits.</li>
            <li><strong>Low fees & speed</strong>: keep cost ≤ 20 drops and latency &lt; 10 s per hire cycle.</li>
            <li><strong>Composable</strong>: future Hooks can enforce binary proofs; UMA / Kleros can arbitrate subjective disputes.</li>
          </ul>

          <h2>3  Protocol Overview</h2>
          <ol>
            <li><strong>Mint PAI Key</strong>
              <ul>
                <li>Human submits <code>SignerListSet</code> (agent weight = 1, quorum = 1).</li>
                <li>Simultaneously submits <code>EscrowCreate</code> locking N XRP to agent.</li>
              </ul>
            </li>
            <li><strong>Agent acts</strong> within delegated scope (spend limits, memos).</li>
            <li><strong>Proof</strong>: Hook or oracle attests to off-chain deliverable.</li>
            <li><strong>EscrowFinish</strong> (auto or human click).</li>
            <li><strong>Revoke / Rotate</strong>: Human can rotate signer list at any time.</li>
          </ol>

          <h2>4  Threat Model</h2>
          <table className="table-auto border-collapse border border-gray-300">
            <thead>
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

          <h2>5  Roadmap</h2>
          <ul>
            <li><strong>Phase 0</strong> (complete): SignerList + Escrow POC on test-net.</li>
            <li><strong>Phase 1</strong> (Q3 2025): Hooks amendment live → on-chain WASM proofs.</li>
            <li><strong>Phase 2</strong>: Integrate UMA optimistic oracle for arbitrary payloads.</li>
            <li><strong>Phase 3</strong>: DID anchoring via XLS-40 for portable PAI Keys.</li>
          </ul>

          <div className="mt-12 text-center">
            <a
              href="https://github.com/buzzfit/pai-key/blob/main/docs/WHITEPAPER.md"
              className="text-blue-600 hover:underline text-lg"
            >
              View full source on GitHub
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
