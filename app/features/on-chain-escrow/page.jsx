// app/features/on-chain-escrow/page.jsx
export const metadata = {
  title: 'On-Chain Escrow – PAI Key',
  description:
    'Lock and release payments automatically using XRPL EscrowCreate/EscrowFinish.',
};

export default function OnChainEscrowPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>On-Chain Escrow</h1>

      <p>
        Secure your vendor payments with XRPL’s built-in escrow:
        submit an <code>EscrowCreate</code>, and funds remain locked until
        conditions are met. No smart-contract code required.
      </p>

      <h2>EscrowCreate Parameters</h2>
      <ul>
        <li><code>Amount</code>: drops of XRP to lock</li>
        <li><code>Destination</code>: vendor’s XRPL address</li>
        <li><code>Condition</code>: SHA-256 hash lock (optional)</li>
        <li><code>FinishAfter</code>: timestamp earliest release</li>
        <li><code>CancelAfter</code>: deadline to refund</li>
      </ul>

      <h2>Releasing Funds</h2>
      <p>
        Call <code>EscrowFinish</code> when you have vendor proof. You can automate
        this via an off-chain watcher or—once enabled—the <a
          href="https://xrpl.org/hooks.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-matrix-green hover:underline"
        >
          Hooks
        </a> amendment.
      </p>

      <h2>Real-World Use</h2>
      <ol>
        <li>At hire time, UI fires <code>EscrowCreate</code> and <code>SignerListSet</code> together.</li>
        <li>Vendor delivers work and submits a cryptographic proof hash.</li>
        <li>Watcher/Hook triggers <code>EscrowFinish</code>; or user clicks “Release”/“Freeze.”</li>
      </ol>

      <h2>Learn More</h2>
      <p>
        XRPL Escrow docs:{" "}
        <a
          href="https://xrpl.org/escrow.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-matrix-green hover:underline"
        >
          EscrowCreate & EscrowFinish
        </a>.
      </p>
    </article>
  );
}
