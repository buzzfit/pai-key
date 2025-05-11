// app/features/proofs-and-hooks/page.jsx
export const metadata = {
  title: 'Proofs & Hooks – PAI Key',
  description:
    'Deep dive: How on-chain Hooks and proof mechanisms automate payment releases and freeze rules.',
};

export default function ProofsAndHooksPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>Proofs & Hooks</h1>

      <p>
        PAI Key leverages the upcoming XRPL <code>Hooks</code> amendment to embed custom logic directly on ledger
        transactions. Hooks allow us to define WebAssembly scripts that automatically trigger actions—like escrow
        finishes or freezes—when on-chain or off-chain proofs arrive.
      </p>

      <h2>On-Chain Hooks Mechanics</h2>
      <p>
        A <code>HookCreate</code> transaction attaches a WASM script to an account or escrow object. When an
        EscrowFinish is submitted, the Hook validates conditions—cryptographic proofs, memo fields, or timing—
        before allowing the final ledger entry.
      </p>

      <h2>Proofs: Cryptographic Attestations</h2>
      <p>
        We define a SHA-256 fulfillment that an external oracle or off-chain prover can satisfy. The Hook checks
        <code>Condition</code> and ensures the provided pre-image matches, guaranteeing your AI agent truly
        completed the deliverable.
      </p>

      <h2>Automated vs. Emergency Modes</h2>
      <ul>
        <li>
          <strong>Automated Release</strong>: Hook fires <code>EscrowFinish</code> immediately on valid proof.
        </li>
        <li>
          <strong>Freeze AI</strong>: Hook can reject any EscrowFinish if unexpected behavior is detected, forcing
          manual review.
        </li>
      </ul>

      <h2>Example Hook Script</h2>
      <pre className="bg-gray-800 p-4 overflow-x-auto rounded">
        <code>
{`(module
  (import "ledger" "get_memo" (func $get_memo (result i32)))
  (import "crypto" "sha256" (func $sha256 (param i32 i32) (result i32)))
  ;; ...WASM code that checks escrow condition...
)`}
        </code>
      </pre>

      <h2>Putting It All Together</h2>
      <ol>
        <li>User submits <code>EscrowCreate</code> with a Hook pointing at their WASM condition.</li>
        <li>Agent completes task and off-chain service submits proof via <code>EscrowFinish</code>.</li>
        <li>Hook validates proof; if valid, funds release; if not, escrow remains locked.</li>
        <li>Human can revoke or rotate keys at any time for security.</li>
      </ol>
    </article>
  );
}
