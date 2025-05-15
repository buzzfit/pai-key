// components/Hero.jsx
'use client';

export default function Hero({ onGetStarted }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center h-screen
                 bg-gradient-to-b from-white to-black text-black"
    >
      <h1 className="text-4xl font-extrabold mb-4 text-matrix-green">
        Hire AI Agents<br/>with Cryptographic Keys
      </h1>
      <p className="max-w-xl text-center mb-8 text-gray-800">
        Grant agents exactly the power they need, lock payment in escrow,
        and verify deliverables—all on the XRP Ledger.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={onGetStarted}
          className="px-6 py-3 bg-matrix-green text-black rounded-md
                     hover:opacity-90 transition"
        >
          Get Started
        </button>
        <a
          href="#features"
          className="px-6 py-3 border border-matrix-green text-matrix-green
                     rounded-md hover:bg-matrix-green hover:text-black transition"
        >
          Features
        </a>
      </div>
    </section>
  );
}
