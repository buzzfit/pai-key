// app/features/on-chain-escrow/page.jsx
export const metadata = {
  title: 'On-Chain Escrow – PAI Key',
  description: 'Deep dive: How on-chain escrow locks funds on the XRP Ledger until deliverables are verified.'
};

export default function OnChainEscrowPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>On-Chain Escrow</h1>
      <p>
        Explain how we leverage XRPL’s native EscrowCreate and EscrowFinish transactions to safely lock
        and release payments only once AI-agent deliverables meet the agreed conditions.
      </p>
      {/* TODO: add examples, flows, and code snippets */}
    </article>
  );
}
