// app/vendors/page.jsx            ❶ REPLACE ENTIRE FILE
'use client';

import { useState }   from 'react';
import { useRouter }  from 'next/navigation';
import VendorDockForm from '../../components/VendorDockForm';
import { connectXummInteractive } from '../../lib/xummConnectClient';

const EMAIL_OK = v => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(v.trim());

export default function VendorsPage() {
  const router = useRouter();
  const [capturedEmail, setCapturedEmail] = useState('');
  const [showForm,      setShowForm]      = useState(false);

  /* ───────────────────── 1) e-mail modal ───────────────────── */
  function EmailGate() {
    const [emailLocal, setEmailLocal] = useState('');
    const [busy,       setBusy]       = useState(false);
    const [err,        setErr]        = useState('');

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Vendor Early-Access</h2>

          <input
            type="email"
            autoFocus
            value={emailLocal}
            onChange={e => setEmailLocal(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border p-2"
          />

          {err && <p className="text-red-600">{err}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => router.push('/')}
                    className="rounded bg-gray-300 px-4 py-2">Cancel</button>

            <button disabled={!EMAIL_OK(emailLocal) || busy}
                    className={`rounded px-4 py-2 ${
                      EMAIL_OK(emailLocal)
                        ? 'bg-matrix-green text-black'
                        : 'bg-matrix-green/40 cursor-not-allowed'
                    }`}
                    onClick={async () => {
                      setBusy(true); setErr('');
                      /* ① send welcome/admin e-mails (optional) */
                      try {
                        await fetch('/api/email', {
                          method:'POST',
                          headers:{'Content-Type':'application/json'},
                          body:JSON.stringify({ role:'vendor', email:emailLocal })
                        });
                        setCapturedEmail(emailLocal);
                        setShowForm(true);
                      } catch {
                        setErr('E-mail failed, try again'); }
                      setBusy(false);
                    }}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────── 2) render ───────────────────── */
  return (
    <>
      {!showForm && <EmailGate />}

      {showForm && (
        <VendorDockForm
          email={capturedEmail}
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            try { return await connectXummInteractive(); }
            catch { alert('Wallet connect failed'); return ''; }
          }}
          onSubmit={async form => {                /* 👈 NEW — post first agent */
            const res = await fetch('/api/agents', {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify(form)
            });
            if (!res.ok) { alert('Save failed'); return; }

            /* jump to the dock - the new agent will appear automatically */
            router.push('/vendors/dock');
          }}
        />
      )}
    </>
  );
}
