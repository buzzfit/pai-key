// app/free-agents/dock/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FreeAgentDockForm from '../../../components/FreeAgentDockForm';

export default function FreeAgentDockPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [agents,  setAgents]  = useState([]);
  const [showForm, setShowForm] = useState(false);

  /* ───── 1) check login via cookie ───── */
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
        if (!me?.account) {
          router.push('/free-agents');   // back to sign-up
          return;
        }
        setAccount(me.account);
      } catch {
        router.push('/free-agents');
      }
    })();
  }, [router]);

  /* ───── 2) load this wallet’s free-agents ───── */
  async function loadAgents(acct) {
    const url   = `/api/free-agents?account=${acct}`;
    const data  = await fetch(url, { cache: 'no-store' }).then(r => r.json());
    setAgents(data.agents || []);
  }
  useEffect(() => { if (account) loadAgents(account); }, [account]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Free-Agent Dock</h1>
          <button onClick={() => router.push('/')}
                  className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">
            Home
          </button>
        </header>

        {/* wallet panel */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="mt-2 break-all text-matrix-green">{account || '—'}</p>

          <div className="mt-4 flex gap-3">
            <button onClick={() => setShowForm(true)}
                    className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90">
              Dock Free-Agent
            </button>
            <button
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                setAccount(null);
                setAgents([]);
                router.push('/free-agents');
              }}
              className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">
              Disconnect
            </button>
          </div>
        </section>

        {/* agent list */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Your Free-Agents</h2>

          {agents.length === 0 ? (
            <p className="mt-3 text-gray-300">
              No free-agents yet. Click “Dock Free-Agent”.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {agents.map(a => (
                <li key={a.id} className="rounded-lg border border-gray-700 p-4">
                  <div className="text-sm text-gray-400">{a.agentType}</div>
                  <div className="mt-1 text-xl font-semibold">{a.name}</div>
                  <div className="text-gray-300">{a.tagline}</div>
                  <div className="mt-2 line-clamp-3 text-sm text-gray-400">
                    {a.description}
                  </div>
                  {/* later we’ll add stats (jobs done, rating, etc.) */}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* modal: add free-agent */}
      {showForm && account && (
        <FreeAgentDockForm
          email=""
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            // already connected – reread cookie so button shows “Wallet Connected”
            const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
            return me?.account || '';
          }}
          onSubmit={async form => {
            const res = await fetch('/api/free-agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });
            if (!res.ok) { alert('Failed to save'); return; }
            setShowForm(false);
            await loadAgents(account);
          }}
        />
      )}
    </div>
  );
}
