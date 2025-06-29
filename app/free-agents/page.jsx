// app/free-agents/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FreeAgentDockForm from '../../components/FreeAgentDockForm';

// RFC-lite validator
const EMAIL_OK = v => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(v.trim());

export default function FreeAgentsPage() {
  const router = useRouter();
  const [capturedEmail, setCapturedEmail] = useState('');
  const [showForm,      setShowForm]      = useState(false);

  /* ── e-mail prompt ───────────────────────── */
  function EmailGate() {
    const [emailLocal, setEmailLocal] = useState('');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Join Free-Agents Early Access</h2>

          <input
            type="email"
            required
            autoFocus
            value={emailLocal}
            onChange={e => setEmailLocal(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border p-2"
          />

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
              disabled={!EMAIL_OK(emailLocal)}
              onClick={() => {
                setCapturedEmail(emailLocal);
                setShowForm(true);
              }}
              className={`rounded px-4 py-2 ${
                EMAIL_OK(emailLocal)
                  ? 'bg-matrix-green text-black'
                  : 'bg-matrix-green/40 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── render ──────────────────────────────── */
  return (
    <>
      {!showForm && <EmailGate />}

      {showForm && (
        <FreeAgentDockForm
          email={capturedEmail}
          onSubmit={data => {
            console.log('TODO: POST /api/free-agents', data);
            setShowForm(false);          // later: router.push('/dashboard')
          }}
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            alert('TODO: wire Xumm connect');
            return '';                   // XRPL address later
          }}
        />
      )}
    </>
  );
}
