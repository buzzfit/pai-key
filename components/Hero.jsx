// components/Hero.jsx
'use client';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-4xl font-extrabold mb-4 text-matrix-green">
        Hire AI Agents<br/>with Cryptographic Keys
      </h1>
      <p className="max-w-xl text-center mb-8">
        Grant agents exactly the power they need, lock payment in escrow, and verify deliverables—all on the XRP Ledger.
      </p>
      <button
        onClick={onGetStarted}
        className="px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
      >
        Get Started
      </button>
    </section>
  );
}
