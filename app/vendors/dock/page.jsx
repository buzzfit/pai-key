// app/vendors/dock/page.jsx     ← REPLACE ENTIRE FILE
'use client';

import { useEffect, useState } from 'react';
import { useRouter }            from 'next/navigation';
import VendorDockForm           from '../../../components/VendorDockForm';
import AgentCard                from '../../../components/AgentCard';

export default function VendorDockPage() {
  const router                = useRouter();
  const [account, setAccount] = useState(null);
  const [agents,  setAgents ] = useState([]);
  const [showForm, setShowForm] = useState(false);

  /* 1. grab wallet from cookie */
  useEffect(() => {
    (async () => {
      const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json())
                        .catch(() => null);
      if (!me?.account) return router.push('/vendors');
      setAccount(me.account);
    })();
  }, [router]);

  /* 2. helpers */
  const loadAgents = async acct => {
    const data = await fetch(`/api/agents?account=${acct}`,
                             { cache:'no-store' }).then(r => r.json());
    setAgents(data.agents || []);
  };

  useEffect(() => { if (account) loadAgents(account); }, [account]);

  /* 3. delete handler */
  const deleteAgent = async id => {
    await fetch(`/api/agents/${id}`, { method:'DELETE' });
    const left = agents.length - 1;
    if (left === 0) return router.push('/vendors');     // last card gone
    loadAgents(account);
  };

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* header + “Add Agent” */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Vendor Dock</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90"
            >
              Add Agent
            </button>
            <button
              onClick={() => router.push('/')}
              className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
            >
              Home
            </button>
          </div>
        </header>

        {/* agents */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">Your Agent{agents.length !== 1 && 's'}</h2>

          {agents.length === 0 ? (
            <p className="mt-3 text-gray-300">No agent yet — click “Add Agent”.</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {agents.map(a => (
                <AgentCard
                  key={a.id}
                  id={a.id}
                  wallet={a.payoutAccount}
                  name={a.name}
                  tagline={a.tagline}
                  description={a.description}
                  hourlyRate={a.hourlyRate}
                  minHours={a.minHours}
                  onRemove={deleteAgent}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* modal: add another agent */}
      {showForm && account && (
        <VendorDockForm
          email=""
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            const me = await fetch('/api/me',{cache:'no-store'}).then(r=>r.json());
            return me?.account || '';
          }}
          onSubmit={async form => {
            await fetch('/api/agents', {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify(form),
            });
            setShowForm(false);
            loadAgents(account);
          }}
        />
      )}
    </div>
  );
}
