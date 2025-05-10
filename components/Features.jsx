const features = [
  {
    title: 'Least-Authority Keys',
    desc: 'Delegate only the permissions an agent needs, for a limited time.',
  },
  {
    title: 'On-Chain Escrow',
    desc: 'Lock funds in XRPL escrow until deliverables are verified.',
  },
  {
    title: 'Proofs & Hooks',
    desc: 'Automate release or freeze rules with on-chain hooks or watchers.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 bg-white rounded-lg shadow hover:shadow-lg">
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
); }
