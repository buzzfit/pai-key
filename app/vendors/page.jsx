// app/vendors/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EMAIL_OK = v => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(v.trim());

export default function VendorsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState('');

  const handleContinue = async () => {
    if (!EMAIL_OK(email) || busy) return;
    setBusy(true); setErr('');

    try {
      // optional notification email
      const r = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'vendor', email }),
      });
      if (!r.ok) throw new Error('mail api failed');

      // go straight to the dock
      router.push('/vendors/dock');
    } catch (e) {
      console.error(e);
      setErr('E-mail failed – please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="text-xl font-semibold">Vendor Early-Access</h2>

        <input
          type="email"
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded border p-2"
        />

        {err && <p className="text-red-600">{err}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => router.push('/')}
            className="rounded bg-gray-300 px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!EMAIL_OK(email) || busy}
            onClick={handleContinue}
            className={`rounded px-4 py-2 ${
              EMAIL_OK(email)
                ? 'bg-matrix-green text-black'
                : 'bg-matrix-green/40 cursor-not-allowed'
            }`}
          >
            {busy ? 'Sending…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
