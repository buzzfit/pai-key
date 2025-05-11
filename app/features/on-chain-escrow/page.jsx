// app/features/on-chain-escrow/page.jsx
export const metadata = {
  title: 'On-Chain Escrow – PAI Key',
  description:
    'Deep dive: How on-chain escrow locks funds on the XRP Ledger until deliverables are verified.',
};

export default function OnChainEscrowPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>On-Chain Escrow</h1>

      <p>
        On the XRP Ledger, <strong>EscrowCreate</strong> transactions let you lock up XRP under explicit
        conditions—either after a specified time or once a cryptographic condition is satisfied. When
        processed, the ledger creates an immutable escrow object that holds your funds until those criteria
        are met.
      </p>

      <h2>EscrowCreate Transaction</h2>
      <p>
        Submit <code>EscrowCreate</code> with parameters:
        <code>Amount</code>, <code>Destination</code>,
        <code>Condition</code>, <code>FinishAfter</code>, and/or <code>CancelAfter</code>. The ledger then
        instantiates an escrow object safeguarding your XRP.
      </p>

      <h2>EscrowFinish Transaction</h2>
      <p>
        To release funds, call <code>EscrowFinish</code>. It validates the cryptographic proof or timeout
        and transfers the XRP to the designated recipient. PAI Key’s off-chain watcher or on-chain Hooks
        can automate this step for you.
      </p>

      <h2>Use Cases in PAI Key</h2>
      <ul>
        <li>
          At hire time, PAI Key’s UI submits both <code>SignerListSet</code> and <code>EscrowCreate</code>
          in one go.
        </li>
        <li>
          Once deliverables meet the agreed criteria, the watcher or Hook triggers
          <code>EscrowFinish</code>, releasing funds.
        </li>
      </ul>

      <h2>Example Flow</h2>
      <ol>
        <li>User clicks “Hire Agent”—UI builds & submits <code>EscrowCreate</code>.</li>
        <li>Agent acts under your delegated signer-list permissions.</li>
        <li>Proof arrives—watcher calls <code>EscrowFinish</code>, freeing the XRP.</li>
        <li>If no proof by deadline, you or a Hook can call <code>EscrowCancel</code> to recover funds.</li>
      </ol>
    </article>
  );
}
