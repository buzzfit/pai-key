// app/vendors/dock/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorDockForm   from '../../../components/VendorDockForm';
import AgentCard        from '../../../components/AgentCard';   // 🔹 NEW

export default function VendorDockPage() {
  const router               = useRouter();
  const [account, setAccount] = useState(null);
  const [agents,  setAgents ] = useState([]);
  const [showForm, setShowForm] = useState(false);

  /* 1 — read wallet from cookie */
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
        if (!me?.account) {
          router.push('/vendors');   // bounce if not logged in
          return;
        }
        setAccount(me.account);
      } catch (err) {
        console.error(err);
        router.push('/vendors');
      }
    })();
  }, [router]);

  /* 2 — helpers to fetch / refresh agent list */
  async function loadAgents(acct) {
    const url  = acct ? `/api/agents?account=${acct}` : '/api/agents';
    const data = await fetch(url, { cache: 'no-store' }).then(r => r.json());
    setAgents(data.agents || []);
  }
  useEffect(() => { if (account) loadAgents(account); }, [account]);

  /* ─────────────────────────────── render ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Vendor Dock</h1>
          <button onClick={() => router.push('/')}
                  className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">
            Home
          </button>
        </header>

        {/* wallet summary */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="mt-2 break-all text-matrix-green">{account || '—'}</p>

          <div className="mt-4 flex gap-3">
            <button onClick={() => setShowForm(true)}
                    className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90">
              Add Agent
            </button>

            <button onClick={async () => {
                      await fetch('/api/logout', { method: 'POST' });
                      setAccount(null); setAgents([]); router.push('/vendors');
                    }}
                    className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">
              Disconnect
            </button>
          </div>
        </section>

        {/* agent list */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Your Agent</h2>

          {agents.length === 0 ? (
            /* first-time placeholder so you can visual-test the layout */
            <div className="mt-4">
              <AgentCard
                wallet={account}
                name="My First Agent"
                tagline="Replace me after submit"
                hourlyRate="0"
                minHours="1"
                onRemove={() => alert('Disconnect stub')}
              />
              <p className="mt-3 text-sm text-gray-400">
                (This sample disappears once you dock a real agent.)
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {agents.map(a => (
                <AgentCard
                  key={a.id}
                  wallet={a.xrpAddr}
                  name={a.name}
                  tagline={a.tagline}
                  hourlyRate={a.hourlyRate}
                  minHours={a.minHours}
                  onRemove={async () => {
                    await fetch(`/api/agents/${a.id}`, { method: 'DELETE' });
                    await loadAgents(account);
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* modal form */}
      {showForm && account && (
        <VendorDockForm
          email=""                     /* optional for vendors */
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            /* wallet already in cookie → just echo so button says Connected */
            try {
              const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
              return me?.account || '';
            } catch { return ''; }
          }}
          onSubmit={async form => {
            const res = await fetch('/api/agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });
            if (!res.ok) return alert('Failed to save agent.');
            setShowForm(false);
            await loadAgents(account);
          }}
        />
      )}
    </div>
  );
}
