// components/Hero.jsx
'use client';

import Image from 'next/image';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen bg-black text-white overflow-hidden">
      {/* 1) Left logo (unchanged) */}
      <div className="absolute top-[-1.5%] left-[19%] sm:top-[23.5%] sm:left-[10.5%]">
        <Image
          src="/logo.png"
          alt="PAI Key Logo"
          width={240}
          height={240}
          className="rounded-full"
        />
      </div>

      {/* 2) Right banner logo (unchanged) */}
      <div className="hidden sm:block absolute top-1/2 right-8 transform -translate-y-1/2">
        <Image
          src="/matrix-right-logo.jpg"
          alt="PAI Key Matrix Art (right)"
          width={500}
          height={300}
          className="rounded-xl drop-shadow-lg"
        />
      </div>

      {/* 3) CONTENT WRAPPER: shifts left on sm+ */}
      <div className="relative z-10 px-4 sm:px-0 transform sm:-translate-x-[12%] text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-matrix-green">
          Hire AI Agents
          <br />
          with Cryptographic Keys
        </h1>

        <p className="max-w-xl mx-auto mb-8 text-gray-200">
          Grant agents exactly the power they need, lock payment in escrow, and verify
          deliverables—all on the XRP Ledger.
        </p>

        {/* 4) BUTTON GROUPS */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {/* Left stack */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
            >
              Hire Agent
            </button>
            <button
              onClick={() => (window.location.href = '/vendors')}
              className="px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
            >
              A.I. Vendors
            </button>
          </div>

          {/* Right stack */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => (window.location.href = '/#features')}
              className="px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
            >
              Features
            </button>
            <button
              onClick={() => (window.location.href = '/free-agents')}
              className="px-6 py-3 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
            >
              Free Agents
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
