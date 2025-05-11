// app/features/proofs-and-hooks/page.jsx
export const metadata = {
  title: 'Proofs & Hooks – PAI Key',
  description: 'Deep dive: How on-chain Hooks and proof mechanisms automate payment releases and freeze rules.'
};

export default function ProofsAndHooksPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>Proofs & Hooks</h1>
      <p>
        Detail how XRPL Hooks and external oracles provide cryptographic proofs to trigger escrow finishes
        or enforce freeze rules automatically—no manual intervention required.
      </p>
      {/* TODO: add diagrams, example Hook scripts, and use cases */}
    </article>
  );
}
