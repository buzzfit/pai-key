// app/free-agents/page.jsx
'use client';
import { useState } from 'react';
import FreeAgentDockForm from '../../components/FreeAgentDockForm';

export default function FreeAgentsPage() {
  const [email, setEmail]     = useState('');
  const [showForm, setShow]   = useState(false);

  const EmailGate = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={e => { e.preventDefault(); if (email) setShow(true); }}
        className="space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800"
      >
        <h2 className="text-xl font-semibold">Join Free-Agents Early Access</h2>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded border p-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-matrix-green px-4 py-2 text-black"
        >
          Continue
        </button>
      </form>
    </div>
  );

  return (
    <>
      {!showForm && <EmailGate />}
      {showForm && (
        <FreeAgentDockForm
          email={email}
          onSubmit={data => {
            console.log('TODO: POST /api/free-agents', data);
            setShow(false);           // or push('/dashboard')
          }}
          onClose={() => setShow(false)}
          onConnectWallet={async () => {
            alert('TODO: wire Xumm connect');
            return '';                // return XRPL address here later
          }}
        />
      )}
    </>
  );
}
