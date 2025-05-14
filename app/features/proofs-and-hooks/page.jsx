// app/features/proofs-and-hooks/page.jsx
export const metadata = {
  title: 'Proofs & Hooks – PAI Key',
  description:
    'Automate releases and freezes with cryptographic proofs and XRPL Hooks.',
};

export default function ProofsAndHooksPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>Proofs & Hooks</h1>

      <p>
        Leverage cryptographic proofs and the forthcoming XRPL <a
          href="https://hooks.xrpl.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-matrix-green hover:underline"
        >
          Hooks
        </a> amendment to automate <code>EscrowFinish</code> or enforce freezes
        based on on-chain or oracle-delivered evidence.
      </p>

      <h2>Proof Types</h2>
      <ul>
        <li><strong>Hash Lock:</strong> Vendor supplies a SHA-256 preimage matching <code>Condition</code>.</li>
        <li><strong>Oracle Callback:</strong> External service attests via signed transaction.</li>
        <li><strong>Time-Lock:</strong> Funds auto-release after <code>FinishAfter</code>.</li>
      </ul>

      <h2>Automated vs Emergency</h2>
      <ul>
        <li><strong>Automated Release:</strong> Hook or watcher triggers <code>EscrowFinish</code> on valid proof.</li>
        <li><strong>Freeze AI:</strong> Hook rejects undesirable finishes; user can review.</li>
      </ul>

      <h2>Example Hook Template</h2>
      <pre className="bg-gray-800 p-4 overflow-x-auto rounded">
        <code>
{`(module
  (import "ledger" "get_condition" (func $get_condition (result i32)))
  (import "crypto" "sha256" (func $sha256 (param i32 i32) (result i32)))
  ;; WASM logic to compare proof with condition...
)`}
        </code>
      </pre>

      <h2>Learn More</h2>
      <p>
        XRPL Hooks proposal:{" "}
        <a
          href="https://hooks.xrpl.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-matrix-green hover:underline"
        >
          Hooks Specification
        </a>.
      </p>
    </article>
  );
}
