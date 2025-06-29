// app/vendors/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorDockForm from '../../components/VendorDockForm';

const EMAIL_OK = v => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(v.trim());

export default function VendorsPage() {
  const router = useRouter();
  const [capturedEmail, setCapturedEmail] = useState('');
  const [showForm,      setShowForm]      = useState(false);

  /* ─ email prompt ─ */
  function EmailGate() {
    const [emailLocal, setEmailLocal] = useState('');
    const [sending,    setSending]    = useState(false);
    const [error,      setError]      = useState('');

    const handleContinue = async () => {
      if (!EMAIL_OK(emailLocal)) return;
      setSending(true); setError('');

      try {
        // call the common server-side route (sends both mails)
        const r = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'vendor', email: emailLocal })
        });
        if (!r.ok) throw new Error('mail api failed');

        setCapturedEmail(emailLocal);
        setShowForm(true);
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
          <h2 className="text-xl font-semibold">Vendor Early-Access Sign-up</h2>

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

  /* ─ render ─ */
  return (
    <>
      {!showForm && <EmailGate />}

      {showForm && (
        <VendorDockForm
          email={capturedEmail}
          onSubmit={() => setShowForm(false)}
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            alert('TODO: wire Xumm connect');
            return '';                 // placeholder address later
          }}
        />
      )}
    </>
  );
}
