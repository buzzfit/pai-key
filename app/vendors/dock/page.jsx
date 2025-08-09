// app/vendors/dock/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter }            from 'next/navigation';
import VendorDockForm           from '../../../components/VendorDockForm';
import AgentCard                from '../../../components/AgentCard';
import { connectXummInteractive } from '../../../lib/xummConnectClient';

export default function VendorDockPage() {
  const router                  = useRouter();
  const [account, setAccount]   = useState(null);
  const [agents,  setAgents]    = useState([]);
  const [showForm, setShowForm] = useState(false);

  // 1) Try to read wallet cookie — DO NOT redirect if missing
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' })
          .then(r => r.json());
        setAccount(me?.account || null);
      } catch {
        setAccount(null);
      }
    })();
  }, []);

  // 2) Fetch / refresh agents (noop if no wallet yet)
  const loadAgents = async (acct) => {
    if (!acct) { setAgents([]); return 0; }
    const data = await fetch(`/api/agents?account=${acct}`, { cache: 'no-store' })
      .then(r => r.json());
    const list = data.agents || [];
    setAgents(list);
    return list.length;
  };
  useEffect(() => { loadAgents(account); }, [account]);

  // 3) Disconnect a single agent; if last one, logout + bounce to signup
  const deleteAgent = async (id) => {
    await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    const remaining = await loadAgents(account);
    if (remaining === 0) {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/vendors');
    }
  };

  // ───────────────────────── UI ─────────────────────────
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
      {/* Dock HUD (sticky) */}
      <div className="sticky top-0 z-40 border-b border-matrix-green/20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-wide">Vendor Dock</span>
            {account && (
              <span className="hidden rounded-md border border-matrix-green/25 px-2 py-0.5 font-mono text-xs text-matrix-green/80 md:inline">
                {account}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
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
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        {/* Status / count */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-matrix-green/80">
            {agents.length === 0
              ? 'No agents docked'
              : `${agents.length} agent${agents.length > 1 ? 's' : ''} docked`}
          </h2>
        </div>

        {/* Cards grid */}
        {agents.length === 0 ? (
          <>
            {!account && (
              <p className="mb-3 text-sm text-gray-400">
                Connect your wallet from the <span className="text-matrix-green">Add Agent</span> modal to start docking agents.
              </p>
            )}
            <div className="rounded-2xl border border-matrix-green/20 bg-gray-900/40 p-6 text-gray-300">
              No agent yet — click <span className="text-matrix-green">“Add Agent”</span>.
            </div>
          </>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                capabilities={a.capabilities}
                onRemove={() => deleteAgent(a.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Modal: add agent — allow opening even if not connected */}
      {showForm && (
        <VendorDockForm
          email=""
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            try {
              // reuse cookie if already connected
              const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
              if (me?.account) return me.account;

              // otherwise run interactive connect
              const acct = await connectXummInteractive();
              setAccount(acct);               // update local state so cards load
              return acct;
            } catch (e) {
              console.error(e);
              return '';
            }
          }}
          onSubmit={async (form) => {
            // ensure we have a wallet before saving
            let acct = account;
            if (!acct) {
              const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
              acct = me?.account || null;
            }
            if (!acct) {
              alert('Please connect your wallet first.');
              return;
            }

            await fetch('/api/agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });

            setShowForm(false);
            loadAgents(acct);
          }}
        />
      )}
    </div>
  );
}
