// components/Hero.jsx
'use client';

import Image from 'next/image';

export default function Hero({ onGetStarted }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center h-screen bg-black text-white"
    >
      {/* Logo positioned 25% down, 12.5% from left */}
      <div
        className="absolute"
        style={{
          top: '25%',
          left: '12.5%',
        }}
      >
        <Image
          src="/logo.png"
          alt="PAI Key Logo"
          width={240}
          height={240}
          className="rounded-full"
        />
      </div>

      <h1 className="text-4xl font-extrabold mb-4 text-matrix-green text-center">
        Hire AI Agents
        <br />
        with Cryptographic Keys
      </h1>

      <p className="max-w-xl text-center mb-8 text-gray-200">
        Grant agents exactly the power they need, lock payment in escrow, and verify
        deliverables—all on the XRP Ledger.
      </p>

      <div className="flex space-x-4">
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
