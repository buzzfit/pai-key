// app/vendors/dock/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorDockForm from '../../../components/VendorDockForm';

export default function VendorDockPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [agents, setAgents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // 1) Load wallet from cookie via /api/me
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
        if (!me?.account) {
          // Not connected: send them back to /vendors to sign in & fill the form
          router.push('/vendors');
          return;
        }
        setAccount(me.account);
      } catch (e) {
        console.error(e);
        router.push('/vendors');
      }
    })();
  }, [router]);

  // 2) Fetch agents for this wallet
  async function loadAgents(acct) {
    const url = acct ? `/api/agents?account=${acct}` : '/api/agents';
    const data = await fetch(url, { cache: 'no-store' }).then(r => r.json());
    setAgents(data.agents || []);
  }

  useEffect(() => {
    if (account) loadAgents(account);
  }, [account]);

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

        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="mt-2 text-matrix-green break-all">
            {account || '—'}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90"
            >
              Add Agent
            </button>
            <button
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                setAccount(null);
                setAgents([]);
                router.push('/vendors');
              }}
              className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
            >
              Disconnect
            </button>
          </div>
        </section>

        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Your Agents</h2>

          {agents.length === 0 ? (
            <p className="mt-3 text-gray-300">No agents yet. Click “Add Agent”.</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {agents.map(a => (
                <li key={a.id} className="rounded-lg border border-gray-700 p-4">
                  <div className="text-sm text-gray-400">{a.agentType}</div>
                  <div className="mt-1 text-xl font-semibold">{a.name}</div>
                  <div className="text-gray-300">{a.tagline}</div>
                  <div className="mt-2 text-sm text-gray-400 line-clamp-3">
                    {a.description}
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-gray-400">Rate:</span> {a.hourlyRate} XRP/h ·
                    <span className="ml-2 text-gray-400">Min:</span> {a.minHours} h
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-gray-400">Completed:</span> {a.completed_jobs} ·
                    <span className="ml-2 text-gray-400">Rating:</span> {a.avg_rating.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {showForm && account && (
        <VendorDockForm
          email={''} // optional for now
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            // Already connected; return cookie account so button says "Wallet Connected"
            try {
              const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
              return me?.account || '';
            } catch {
              return '';
            }
          }}
          onSubmit={async (form) => {
            // POST to our in-memory API
            const res = await fetch('/api/agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });
            if (!res.ok) {
              alert('Failed to save agent.'); 
              return;
            }
            setShowForm(false);
            await loadAgents(account);
          }}
        />
      )}
    </div>
  );
}
