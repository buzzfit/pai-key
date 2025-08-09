// app/vendors/dock/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorDockForm from '../../../components/VendorDockForm';
import AgentCard from '../../../components/AgentCard';
import { connectXummInteractive } from '../../../lib/xummConnectClient';

export default function VendorDockPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null); // may be null if not connected yet
  const [agents, setAgents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Load session + agents on first render. Do NOT redirect if no wallet.
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
        const acct = me?.account || null;
        setAccount(acct);
        await loadAgents(acct); // if null, loads all agents
      } catch {
        // still try to show public dock with all agents
        await loadAgents(null);
      }
    })();
  }, []);

  // Helper to load agents. If acct provided → only that vendor; else → all agents.
  const loadAgents = async (acct) => {
    const url = acct ? `/api/agents?account=${acct}` : '/api/agents';
    const data = await fetch(url, { cache: 'no-store' }).then(r => r.json());
    setAgents(data.agents || []);
    return (data.agents || []).length;
  };

  // Remove one agent; if none left and you were logged in, log out + send to signup
  const deleteAgent = async (id) => {
    await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    const remaining = await loadAgents(account);
    if (remaining === 0 && account) {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/vendors'); // back to email gate
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Vendor Dock</h1>

          {/* Always allow adding; if not connected, the form will prompt wallet connect */}
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90"
          >
            Add Agent
          </button>
        </header>

        {/* Agents */}
        <section className="rounded-xl bg-gray-900 p-4">
          <h2 className="text-lg font-semibold">
            Your Agent{agents.length !== 1 && 's'}
          </h2>

          {/* If browsing without a wallet and there are agents from multiple vendors,
              this list is "global". Once you connect, it will filter to your wallet. */}
          {agents.length === 0 ? (
            <p className="mt-3 text-gray-300">
              No agent yet — click “Add Agent”.
            </p>
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

      {/* Modal: add-agent form */}
      {showForm && (
        <VendorDockForm
          email="" // not used for vendors right now
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            try {
              // If not connected yet, this opens Xaman and sets cookies on success
              const acct = await connectXummInteractive();
              // refresh session + show only this vendor’s agents going forward
              setAccount(acct);
              await loadAgents(acct);
              return acct;
            } catch (err) {
              console.error(err);
              alert('Wallet connect failed or timed out.');
              return '';
            }
          }}
          onSubmit={async (form) => {
            // POST the new agent (requires wallet cookie; form's connect button handles it)
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

            // If user just connected inside the form, ensure we reflect the new cookie
            try {
              const me = await fetch('/api/me', { cache: 'no-store' }).then(r => r.json());
              const acct = me?.account || account;
              setAccount(acct);
              await loadAgents(acct);
            } catch {
              await loadAgents(account);
            }
          }}
        />
      )}
    </div>
  );
}
