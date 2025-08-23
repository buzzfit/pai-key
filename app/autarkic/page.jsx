// app/free-agents/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FreeAgentDockForm from '../../components/FreeAgentDockForm';
import { connectXummInteractive } from '../../lib/xummConnectClient';

// simple e-mail validator
const EMAIL_OK = v => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(v.trim());

export default function FreeAgentsPage() {
  const router = useRouter();
  const [capturedEmail, setCapturedEmail] = useState('');
  const [showForm,      setShowForm]      = useState(false);

  /* ── 1) e-mail prompt ───────────────────── */
  function EmailGate() {
    const [emailLocal, setEmailLocal] = useState('');
    const [sending,    setSending]    = useState(false);
    const [error,      setError]      = useState('');

    const handleContinue = async () => {
      if (!EMAIL_OK(emailLocal) || sending) return;
      setSending(true); setError('');

      try {
        // ① send admin + welcome emails
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'free', email: emailLocal }),
        });

        // ② redirect to dock page instead of opening the form
        setCapturedEmail(emailLocal);
        router.push('/free-agents/dock');
      } catch (e) {
        console.error(e);
        setError('E-mail failed – please try again.');
      } finally {
        setSending(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Join Autarkic-Agents Early Access</h2>

          <input
            type="email"
            autoFocus
            value={emailLocal}
            onChange={e => setEmailLocal(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border p-2"
          />

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="rounded bg-gray-300 px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!EMAIL_OK(emailLocal) || sending}
              onClick={handleContinue}
              className={`rounded px-4 py-2 ${
                EMAIL_OK(emailLocal)
                  ? 'bg-matrix-green text-black'
                  : 'bg-matrix-green/40 cursor-not-allowed'
              }`}
            >
              {sending ? 'Sending…' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 2) render ──────────────────────────── */
  return (
    <>
      {!showForm && <EmailGate />}

      {showForm && (
        <FreeAgentDockForm
          email={capturedEmail}
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            try {
              const acct = await connectXummInteractive();
              return acct; // button flips to "Wallet Connected"
            } catch (err) {
              console.error(err);
              alert('Wallet connect failed or timed out.');
              return '';
            }
          }}
          onSubmit={() => {
            // after saving, jump to the Free-Agent dock
            router.push('/free-agents/dock');
          }}
        />
      )}
    </>
  );
}
