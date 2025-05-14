// app/features/least-authority-keys/page.jsx
export const metadata = {
  title: 'Least-Authority Keys – PAI Key',
  description:
    'How PAI Key issues minimal-scope PAI Keys (SignerListSet) so vendors can act only as you allow.',
};

export default function LeastAuthorityPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>Least-Authority Keys</h1>

      <p>
        Delegate precisely the authority your chosen <strong>vendors</strong> need—no more, no less—
        using XRPL’s native <a
          href="https://xrpl.org/multi-signing.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-matrix-green hover:underline"
        >
          Multi-Signing (SignerListSet)
        </a> primitive.
      </p>

      <h2>How It Works</h2>
      <ol>
        <li>
          **Configure** your PAI Key: select vendor public keys, assign each a <code>SignerWeight</code>, and set your <code>SignerQuorum</code>.
        </li>
        <li>
          **Submit** <code>SignerListSet</code>: the ledger records your scoped-authority list.
        </li>
        <li>
          **Verify** via <code>account_objects</code> RPC that the PAI Key is active.
        </li>
      </ol>

      <h2>Why It Matters</h2>
      <ul>
        <li>
          <strong>Security:</strong> Vendors can only sign the transactions you define.
        </li>
        <li>
          <strong>Flexibility:</strong> Rotate or remove keys instantly to revoke authority.
        </li>
        <li>
          <strong>Clarity:</strong> Users see “X of Y weight required” before every hire.
        </li>
      </ul>

      <h2>Learn More</h2>
      <p>
        Deep dive into the spec on the XRPL docs:{" "}
        <a
          href="https://xrpl.org/multi-signing.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-matrix-green hover:underline"
        >
          Multi-Signing
        </a>.
      </p>
    </article>
  );
}
