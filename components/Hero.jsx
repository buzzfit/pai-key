'use client';

import Image from 'next/image';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen bg-black text-white overflow-hidden">
      {/* 1) Left logo */}
      <div className="absolute top-[-1.5%] left-[19%] sm:top-[23.5%] sm:left-[10.5%]">
        <Image
          src="/logo.png"
          alt="PAI Key Logo"
          width={240}
          height={240}
          className="rounded-full"
        />
      </div>

      {/* 2) Right banner artwork */}
      <div className="hidden sm:block absolute top-1/2 right-8 -translate-y-1/2">
        <Image
          src="/matrix-right-logo.jpg"
          alt="PAI Key Matrix Art (right)"
          width={500}
          height={300}
          className="rounded-xl drop-shadow-lg"
        />
      </div>

      {/* 3) Headline & copy */}
      <div className="relative z-10 px-4 sm:px-0 sm:-translate-x-[12%] text-center">

        {/* Xaman requirement badge */}
        <div className="mb-4 flex justify-center items-center gap-2 text-matrix-green text-base font-semibold">
          <span>Requires</span>
          <a
            href="https://xaman.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline rounded-md bg-[#2d6cff] px-3 py-1 text-white font-bold hover:opacity-90 transition"
          >
            xaman
          </a>
          <span>Wallet</span>
        </div>

        <h1 className="mb-4 text-4xl font-extrabold text-matrix-green">
          Hire AI Agents
          <br />
          with Cryptographic Keys
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-gray-200">
          Grant agents exactly the power they need, lock payment in escrow, and verify
          deliverables—all on the XRP Ledger.
        </p>

        {/* 4) Action buttons */}
        <div className="flex flex-col justify-center gap-6 sm:flex-row">
          <div className="flex flex-col space-y-2">
            <button
              onClick={onGetStarted}
              className="rounded-md bg-matrix-green px-6 py-3 text-black transition hover:opacity-90"
            >
              Hire Agent
            </button>
            <button
              onClick={() => (window.location.href = '/vendors')}
              className="rounded-md bg-matrix-green px-6 py-3 text-black transition hover:opacity-90"
            >
              A.I. Vendors
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => (window.location.href = '/#features')}
              className="rounded-md bg-matrix-green px-6 py-3 text-black transition hover:opacity-90"
            >
              Features
            </button>
            <button
              onClick={() => (window.location.href = '/autarkic')}
              className="rounded-md bg-matrix-green px-6 py-3 text-black transition hover:opacity-90"
            >
              Autarkic&nbsp;Agents
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
