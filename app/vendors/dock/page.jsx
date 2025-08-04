// app/vendors/dock/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter }           from 'next/navigation';

import VendorDockForm from '../../../components/VendorDockForm';
import AgentCard      from '../../../components/AgentCard';

export default function VendorDockPage() {
  const router               = useRouter();
  const [account, setAccount] = useState(null);
  const [agents,  setAgents ] = useState([]);
  const [showForm, setShowForm] = useState(false);

  /* ── read wallet from cookie ── */
  useEffect(() => {
    (async () => {
      const me = await fetch('/api/me', { cache: 'no-store' })
                 .then(r => r.json()).catch(() => ({}));
      if (!me?.account) return router.push('/vendors');
      setAccount(me.account);
    })();
  }, [router]);

  /* ── fetch / refresh agents ── */
  const refresh = async (acct = account) => {
    if (!acct) return;
    const data = await fetch(`/api/agents?account=${acct}`, { cache: 'no-store' })
                  .then(r => r.json()).catch(() => ({ agents: [] }));
    setAgents(data.agents || []);
  };
  useEffect(() => { refresh(); }, [account]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/vendors');
  };

  /* ───────────────────────── render */
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Vendor Dock</h1>
          <button
            onClick={() => router.push('/')}
            className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
          >
            Home
          </button>
        </header>

        {/* wallet summary */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="mt-2 break-all text-matrix-green">{account || '—'}</p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90"
            >
              Add Agent
            </button>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
            >
              Disconnect
            </button>
          </div>
        </section>

        {/* agent list */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Your Agent</h2>

          {agents.length === 0 ? (
            <p className="mt-3 text-gray-300">
              No agent yet – click “Add Agent”.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {agents.map(a => (
                <AgentCard
                  key={a.id}
                  wallet={a.payoutAccount}
                  name={a.name}
                  tagline={a.tagline}
                  hourlyRate={a.hourlyRate}
                  minHours={a.minHours}
                  onRemove={async () => {
                    await fetch(`/api/agents/${a.id}`, { method: 'DELETE' });
                    await refresh();
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {showForm && account && (
        <VendorDockForm
          email=""
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => account}
          onSubmit={async form => {
            const r = await fetch('/api/agents', {
              method : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body   : JSON.stringify(form),
            });
            if (r.ok) {
              setShowForm(false);
              await refresh();
            } else {
              alert('Failed to save agent.');
            }
          }}
        />
      )}
    </div>
  );
}
