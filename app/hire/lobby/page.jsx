// app/hire/lobby/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HireLobbyPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);

  /* ───── 1) verify login via /api/me ───── */
  useEffect(() => {
    (async () => {
      const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
      if (!me?.account) {
        router.push('/');          // no wallet → back to landing
        return;
      }
      setAccount(me.account);
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hire Lobby</h1>
          <button onClick={() => router.push('/')}
                  className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">
            Home
          </button>
        </header>

        {/* wallet panel */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="mt-2 break-all text-matrix-green">{account || '—'}</p>

          <div className="mt-4">
            <button
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                router.push('/');        // bounce home
              }}
              className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
            >
              Disconnect
            </button>
          </div>
        </section>

        {/* placeholder matches */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Top Matches</h2>
          <p className="mt-3 text-gray-300">
            (Matching engine coming soon – your future AI agents will appear here.)
          </p>
        </section>
      </div>
    </div>
  );
}
