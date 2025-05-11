// components/Features.jsx
import Link from 'next/link';

const features = [
  {
    title: 'Least-Authority Keys',
    desc: 'Delegate only the permissions an agent needs, for a limited time.',
    slug: 'least-authority-keys'
  },
  {
    title: 'On-Chain Escrow',
    desc: 'Lock funds in XRPL escrow until deliverables are verified.',
    slug: 'on-chain-escrow'
  },
  {
    title: 'Proofs & Hooks',
    desc: 'Automate release or freeze rules with on-chain hooks or watchers.',
    slug: 'proofs-and-hooks'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-black text-matrix-green">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <Link key={f.slug} href={`/features/${f.slug}`}>
              <a className="cursor-pointer block p-6 bg-black bg-opacity-50 rounded-lg shadow-lg hover:bg-opacity-70 border-l-4 border-matrix-green">
                <h3 className="text-xl font-bold mb-2 text-matrix-green">{f.title}</h3>
                <p>{f.desc}</p>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
