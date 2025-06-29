// app/free-agents/page.jsx
'use client';
import { useState } from 'react';
import FreeAgentDockForm from '../../components/FreeAgentDockForm';

export default function FreeAgentsPage() {
  const [capturedEmail, setCapturedEmail] = useState('');
  const [showForm, setShowForm]          = useState(false);

  function EmailGate() {
    const [emailLocal, setEmailLocal] = useState('');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Join Free-Agents Early Access</h2>
          <input
            type="email"
            required
            value={emailLocal}
            onChange={e => setEmailLocal(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border p-2"
            autoFocus
          />
          <button
            onClick={() => {
              if (emailLocal) {
                setCapturedEmail(emailLocal);
                setShowForm(true);
              }
            }}
            className="w-full rounded bg-matrix-green px-4 py-2 text-black"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!showForm && <EmailGate />}
      {showForm && (
        <FreeAgentDockForm
          email={capturedEmail}
          onSubmit={data => {
            console.log('TODO: POST /api/free-agents', data);
            setShowForm(false);          // later: route to dashboard
          }}
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            alert('TODO: wire Xumm connect');
            return '';                   // return XRPL address later
          }}
        />
      )}
    </>
  );
}
