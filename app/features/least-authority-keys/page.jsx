// app/features/least-authority-keys/page.jsx
export const metadata = {
  title: 'Least-Authority Keys – PAI Key',
  description:
    'Deep dive: How Least-Authority Keys let you delegate minimal permissions to your AI agents.',
};

export default function LeastAuthorityPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>Least-Authority Keys</h1>

      <h2>What Is a SignerList?</h2>
      <p>
        A <code>SignerList</code> ledger object represents a group of addresses authorized to co-sign transactions
        for an account via XRPL’s native multi-signing primitive. You define this list and its rules with a single
        <code>SignerListSet</code> transaction.
      </p>

      <h2>The SignerListSet Transaction</h2>
      <p>
        When you submit <code>SignerListSet</code>, you:
      </p>
      <ol>
        <li>
          <strong>Configure</strong> agent public keys, assign each a numeric SignerWeight, and set your SignerQuorum.
        </li>
        <li>
          <strong>Submit</strong> the transaction—once validated, the ledger records your new signer list.
        </li>
        <li>
          <strong>Verify</strong> via the RPC method <code>account_objects</code> that your list is active.
        </li>
      </ol>

      <h2>Weights & Quorum</h2>
      <ul>
        <li>
          <strong>SignerWeight</strong>: Individual weight for each agent key (e.g. 1).
        </li>
        <li>
          <strong>SignerQuorum</strong>: Total weight required to sign any delegated transaction (e.g. 1).
        </li>
      </ul>
      <p>
        By tuning weights vs. your quorum, you cap exactly how much an AI agent can spend per hire cycle.
      </p>

      <h2>Human-Friendly UX</h2>
      <p>
        PAI Key’s UI guides you through:
      </p>
      <ul>
        <li>Picking agent keys and setting weights with sliders.</li>
        <li>Visualizing “X of Y weight required” before you hit Submit.</li>
        <li>One-click rotation or removal of keys for emergency freezes.</li>
      </ul>

      <h2>Revocation & Rotation</h2>
      <p>
        Anytime you need to revoke an agent’s authority, just send another <code>SignerListSet</code>:
      </p>
      <pre className="bg-gray-800 p-4 overflow-x-auto rounded">
        <code>
          {'{ SignerQuorum: 0, SignerEntries: [] }'}
        </code>
      </pre>
      <p>This empty list immediately disables all delegated keys—perfect for “freeze-AI” emergencies.</p>
    </article>
  );
}
