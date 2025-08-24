// app/hire/lobby/page.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentCard from '../../../components/AgentCard';

export default function HireLobbyPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);

  // Live agents feed
  const [items, setItems] = useState([]);      // merged vendor + autarkic
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');              // search query
  const [scope, setScope] = useState('all');   // all | vendor | autarkic

  /* ───── 1) verify login via /api/me ───── */
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
        if (!me?.account) {
          router.push('/');          // no wallet → back to landing
          return;
        }
        setAccount(me.account);
      } catch {
        router.push('/');
      }
    })();
  }, [router]);

  /* ───── 2) load all live agents (vendor + autarkic) ───── */
  const loadAgents = async () => {
    setLoading(true);
    try {
      const [vRes, aRes] = await Promise.all([
        fetch('/api/agents', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/free-agents', { cache: 'no-store' }).then(r => r.json()),
      ]);
      const vendor   = (vRes?.agents || []).map(a => ({ ...a, _origin: 'vendor' }));
      const autarkic = (aRes?.agents || []).map(a => ({ ...a, _origin: 'autarkic' }));
      const merged   = [...vendor, ...autarkic].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
      setItems(merged);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load once when lobby mounts
    loadAgents();
  }, []);

  /* ───── 3) local filtering ───── */
  const filtered = useMemo(() => {
    let list = items;
    if (scope !== 'all') list = list.filter(i => i._origin === scope);
    if (q.trim()) {
      const n = q.toLowerCase();
      list = list.filter(i =>
        (i.name || '').toLowerCase().includes(n) ||
        (i.tagline || '').toLowerCase().includes(n) ||
        (i.description || '').toLowerCase().includes(n) ||
        (Array.isArray(i.capabilities)
          ? i.capabilities.join(',')
          : String(i.capabilities || '')
        ).toLowerCase().includes(n)
      );
    }
    return list;
  }, [items, q, scope]);

  return (
    <div
      className="min-h-screen bg-black text-white p-6"
      style={{
        background:
          'radial-gradient(1200px 600px at 70% -20%, rgba(30,255,140,0.08), transparent 60%), ' +
          'radial-gradient(900px 500px at 10% 120%, rgba(30,255,140,0.06), transparent 60%), ' +
          'linear-gradient(to bottom, #000, #050505 35%, #000)',
      }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hire Lobby</h1>
          <button
            onClick={() => router.push('/')}
            className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
          >
            Home
          </button>
        </header>

        {/* wallet panel */}
        <section className="rounded-xl border border-matrix-green/20 bg-gray-900/40 p-4">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="mt-2 break-all text-matrix-green">{account || '—'}</p>

        <div className="mt-4 flex gap-3">
            <button
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                router.push('/');        // bounce home
              }}
              className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
            >
              Disconnect
            </button>
            <button
              onClick={loadAgents}
              className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90"
            >
              Refresh Agents
            </button>
          </div>
        </section>

        {/* live agents feed controls */}
        <section className="rounded-xl border border-matrix-green/20 bg-gray-900/40 p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Live Agents</h2>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search name, capability, description…"
                className="w-full md:w-80 rounded border border-matrix-green/30 bg-white p-2 text-black placeholder-gray-500"
              />
              <select
                value={scope}
                onChange={e => setScope(e.target.value)}
                className="rounded border border-matrix-green/30 bg-white p-2 text-black"
              >
                <option value="all">All</option>
                <option value="vendor">Vendors</option>
                <option value="autarkic">Autarkic</option>
              </select>
            </div>
          </div>

          {/* grid */}
          {loading ? (
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              Loading live agents…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
              No agents are live yet.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map(a => (
                <AgentCard
                  key={`${a._origin}-${a.id}`}
                  id={a.id}
                  wallet={a.payoutAccount || a.vendorAccount || ''}
                  name={a.name}
                  tagline={a.tagline}
                  description={a.description}
                  hourlyRate={a.hourlyRate}
                  minHours={a.minHours}
                  capabilities={a.capabilities}
                  agentType={a.agentType}
                  origin={a._origin}   // ← badge: Vendor | Autarkic
                  readonly
                />
              ))}
            </ul>
          )}
        </section>

        {/* matchmaker placeholder (future slot) */}
        <section className="rounded-xl border border-dashed border-matrix-green/30 bg-gray-900/30 p-4">
          <h2 className="text-lg font-semibold">Top Matches</h2>
          <p className="mt-3 text-gray-300">
            (Matching engine coming soon – skills • budget • availability • proximity.)
          </p>
        </section>
      </div>
    </div>
  );
}
