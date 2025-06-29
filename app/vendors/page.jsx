// app/vendors/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { init, send } from '@emailjs/browser';
import VendorDockForm from '../../components/VendorDockForm';

const EMAIL_OK = v => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(v.trim());

/* your EmailJS IDs */
const SERVICE_ID          = 'service_pai_smtp';
const TEMPLATE_WELCOME_ID = 'template_ydort24';  // template_welcome
const TEMPLATE_ADMIN_ID   = 'template_7kj4bte';  // template_admin
const PUBLIC_KEY          = 'qw2tG7e_AKMJ2Ml_y';

export default function VendorsPage() {
  const router = useRouter();
  const [capturedEmail, setCapturedEmail] = useState('');
  const [showForm,      setShowForm]      = useState(false);

  /* initialise EmailJS once */
  useEffect(() => { init(PUBLIC_KEY); }, []);

  /* ─ email prompt ─ */
  function EmailGate() {
    const [emailLocal, setEmailLocal] = useState('');
    const [sending,    setSending]    = useState(false);
    const [error,      setError]      = useState('');

    const handleContinue = async () => {
      if (!EMAIL_OK(emailLocal) || sending) return;
      setSending(true); setError('');

      try {
        /* 1️⃣ admin alert */
        await send(SERVICE_ID, TEMPLATE_ADMIN_ID, {
          user_email: emailLocal,
          user_type : 'vendor',
        });

        /* 2️⃣ welcome e-mail */
        await send(SERVICE_ID, TEMPLATE_WELCOME_ID, {
          to_email : emailLocal,
          user_type: 'vendor',
        });

        /* open dock form */
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
          onConnectWallet={async () => ''}
        />
      )}
    </>
  );
}
