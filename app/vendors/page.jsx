// app/vendors/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorDockForm from '../../components/VendorDockForm';

export default function VendorsPage() {
  const router = useRouter();
  const [capturedEmail, setCapturedEmail] = useState('');
  const [showForm, setShowForm]          = useState(false);

  function EmailGate() {
    const [emailLocal, setEmailLocal] = useState('');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Vendor Early-Access Sign-up</h2>

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
              disabled={!emailLocal}
              onClick={() => {
                setCapturedEmail(emailLocal);
                setShowForm(true);
              }}
              className={`rounded px-4 py-2 ${
                emailLocal
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

  return (
    <>
      {!showForm && <EmailGate />}

      {showForm && (
        <VendorDockForm
          email={capturedEmail}
          onSubmit={data => {
            console.log('TODO: POST /api/vendors', data);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
          onConnectWallet={async () => {
            alert('TODO: wire Xumm connect');
            return '';
          }}
        />
      )}
    </>
  );
}
