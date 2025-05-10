export default function Hero() {
  return (
    <section className="w-full py-20 bg-white text-center">
      <h1 className="text-5xl font-bold mb-4">
        Hire AI Agents<br/> with Cryptographic Keys
      </h1>
      <p className="text-xl mb-8 max-w-2xl mx-auto">
        Grant agents exactly the power they need, lock payment in escrow, and verify deliverables—all on the XRP Ledger.
      </p>
      <div className="space-x-4">
        <a
          href="#features"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Features
        </a>
        <a
          href="https://app.pai-key.org"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
