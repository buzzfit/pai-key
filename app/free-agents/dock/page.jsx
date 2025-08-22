// app/free-agents/dock/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentCard from '../../../components/AgentCard';
import FreeAgentDockForm from '../../../components/FreeAgentDockForm';
// use Xaman naming via alias (file rename later)
import { connectXummInteractive as connectXamanInteractive } from '../../../lib/xummConnectClient';

export default function FreeAgentDockPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [mine, setMine] = useState(null);        // your single autarkic agent
  const [allAgents, setAllAgents] = useState([]); // global directory
  const [showForm, setShowForm] = useState(false);

  // Read wallet cookie (no redirect if missing; show empty dock)
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
        setAccount(me?.account || null);
      } catch {
        setAccount(null);
      }
    })();
  }, []);

  // Fetch my agent (at most one) and global directory
  const loadMine = async (acct) => {
    if (!acct) { setMine(null); return 0; }
    const data = await fetch(`/api/free-agents?account=${acct}`, { cache: 'no-store' }).then(r => r.json());
    const list = data.agents || [];
    setMine(list[0] || null);
    return list.length;
  };
  const loadAll = async () => {
    const data = await fetch('/api/free-agents', { cache: 'no-store' }).then(r => r.json());
    setAllAgents(data.agents || []);
  };

  useEffect(() => { loadMine(account); }, [account]);
  useEffect(() => { loadAll(); }, [account]); // refresh directory once you connect

  // Delete my agent (owner-only; API enforces)
  const deleteMine = async (id) => {
    const res = await fetch(`/api/free-agents/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const e = await res.json().catch(() => null);
      alert(e?.error || 'Failed to remove agent.');
      return;
    }
    setMine(null);
    await loadAll();
  };

  // Sign out (logout endpoint will soon undock autarkic too in the next step)
  const signOut = async () => {
    try { await fetch('/api/logout', { method: 'POST' }); } catch {}
    setAccount(null);
    setMine(null);
    setAllAgents([]);
    router.replace('/');
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          'radial-gradient(1200px 600px at 70% -20%, rgba(30,255,140,0.08), transparent 60%), ' +
          'radial-gradient(900px 500px at 10% 120%, rgba(30,255,140,0.06), transparent 60%), ' +
          'linear-gradient(to bottom, #000, #050505 35%, #000)',
      }}
    >
      {/* HUD */}
      <div className="sticky top-0 z-40 border-b border-matrix-green/20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-wide">Autarkic Dock</span>
            {account && (
              <span className="hidden rounded-md border border-matrix-green/25 px-2 py-0.5 font-mono text-xs text-matrix-green/80 md:inline">
                {account}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {account && (
              <button
                onClick={signOut}
                className="rounded-xl border border-matrix-green/30 px-3 py-2 text-matrix-green/90 hover:bg-black/30"
              >
                Sign out
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-matrix-green px-4 py-2 text-black shadow-lg shadow-matrix-green/20 transition hover:translate-y-[1px] hover:opacity-95"
            >
              Add Agent
            </button>
          </div>
        </div>
      </div>

      {/* Dock bay */}
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 space-y-10">
        {/* Your agent (single) */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-matrix-green/80">
            {mine ? 'Your Autarkic Agent' : 'No agent docked yet'}
          </h2>

          {!mine ? (
            <div className="rounded-2xl border border-matrix-green/20 bg-gray-900/40 p-6 text-gray-300">
              Click <span className="text-matrix-green">“Add Agent”</span> to connect your wallet and dock your agent.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6">
              <AgentCard
                key={mine.id}
                id={mine.id}
                wallet={mine.payoutAccount}
                name={mine.name}
                tagline={mine.tagline}
                description={mine.description}
                hourlyRate={mine.hourlyRate}
                minHours={mine.minHours}
                capabilities={mine.capabilities}
                agentType={mine.agentType}
                onRemove={() => deleteMine(mine.id)}
              />
            </ul>
          )}
        </section>

        {/* Global directory */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-matrix-green/80">All Autarkic Agents</h2>
          {allAgents.length === 0 ? (
            <div className="rounded-2xl border border-matrix-green/20 bg-gray-900/40 p-6 text-gray-300">
              No agents in the directory yet.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {allAgents.map(a => (
                <AgentCard
                  key={a.id}
                  id={a.id}
                  wallet={a.payoutAccount}
                  name={a.name}
                  tagline={a.tagline}
                  description={a.description}
                  hourlyRate={a.hourlyRate}
                  minHours={a.minHours}
                  capabilities={a.capabilities}
                  agentType={a.agentType}
                  // Only show Disconnect if this card belongs to the signed-in wallet
                  onRemove={account && a.vendorAccount === account ? () => deleteMine(a.id) : undefined}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Modal: add agent → require interactive Xaman connect */}
      {showForm && (
        <FreeAgentDockForm
          email=""
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            try {
              const acct = await connectXamanInteractive();
              setAccount(acct);
              await loadMine(acct);
              return acct;
            } catch (e) {
              console.error(e);
              return '';
            }
          }}
          onSubmit={async (form) => {
            if (!account) { alert('Please connect your wallet first.'); return; }
            const res = await fetch('/api/free-agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });
            if (res.status === 409) {
              const msg = await res.json().catch(() => null);
              alert(msg?.error || 'You already have an autarkic agent docked.');
              return;
            }
            if (!res.ok) { alert('Failed to dock agent'); return; }
            setShowForm(false);
            await loadMine(account);
            await loadAll();
          }}
        />
      )}
    </div>
  );
}
