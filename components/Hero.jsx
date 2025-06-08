// components/Hero.jsx 
'use client';

import Image from 'next/image';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen bg-black text-white overflow-hidden">
      {/* ────────────────────────────────────────────────
          1) LEFT LOGO (exactly as before for mobile & desktop)
      ──────────────────────────────────────────────── */}
      <div className="absolute top-[-1.5%] left-[19%] sm:top-[23.5%] sm:left-[12.5%]">
        <Image
          src="/logo.png"
          alt="PAI Key Logo"
          width={240}
          height={240}
          className="rounded-full"
        />
      </div>

      {/* ────────────────────────────────────────────────
          2) RIGHT “MATRIX” LOGO (only visible on screens ≥640px)
      ──────────────────────────────────────────────── */}
      <div className="hidden sm:block absolute top-1/2 right-8 transform -translate-y-1/2">
        <Image
          src="/matrix-right-logo.jpg"
          alt="PAI Key Matrix Art (right)"
          width={500}
          height={300}
          className="rounded-xl drop-shadow-lg"
        />
      </div>

      {/* ────────────────────────────────────────────────
          3) HERO TEXT & BUTTONS
      ──────────────────────────────────────────────── */}
      <h1 className="relative z-10 text-4xl font-extrabold mb-4 text-matrix-green text-center px-4 sm:px-0">
        Hire AI Agents
        <br />
        with Cryptographic Keys
      </h1>

      <p className="relative z-10 max-w-xl text-center mb-8 text-gray-200 px-4 sm:px-0">
        Grant agents exactly the power they need, lock payment in escrow, and verify
        deliverables—all on the XRP Ledger.
      </p>

      <div className="relative z-10 flex space-x-4">
        <button
          onClick={onGetStarted}
          className="px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
        >
          Get Started
        </button>
        <button
          onClick={() => (window.location.href = '/#features')}
          className="px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
        >
          Features
        </button>
      </div>
    </section>
  );
}
