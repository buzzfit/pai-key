// components/EmailSignupForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { init, send } from '@emailjs/browser';

const PUBLIC_KEY = 'qw2tG7e_AKMJ2Ml_y';
const SERVICE_ID = 'service_pai_smtp';
const TEMPLATE_USER  = 'template_user_confirm';
const TEMPLATE_ADMIN = 'template_admin_notify';

// quick e-mail validator
const EMAIL_OK = v => /^\S+@\S+\.\S+$/.test(v.trim());

export default function EmailSignupForm({ onSignUp, onClose, onConnectWallet }) {
  useEffect(() => { init(PUBLIC_KEY); }, []);

  const [email,   setEmail]   = useState('');
  const [xrpAddr, setXrpAddr] = useState('');
  const [error,   setError]   = useState('');
  const [status,  setStatus]  = useState('');
  const canSubmit = EMAIL_OK(email) && xrpAddr && !status.startsWith('Sending');

  /* submit → send both e-mails */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('Sending…'); setError('');

    try {
      /* notify admin */
      await send(SERVICE_ID, TEMPLATE_ADMIN, {
        user_email : email,
        user_type  : 'hirer',
      });

      /* confirmation to user */
      await send(SERVICE_ID, TEMPLATE_USER, {
        to_email   : email,
        user_type  : 'hirer',
      });

      /* proceed */
      localStorage.setItem('paiKeySignedUp', 'true');
      localStorage.setItem('paiKeyEmail', email);
      setStatus('Success! Check your inbox.');
      onSignUp({ email, xrpAddr });

    } catch (err) {
      console.error('EmailJS error:', err);
      setError('Failed to send e-mails. Please try again later.');
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-md bg-white p-6"
      >
        <h2 className="text-2xl font-bold">Sign Up for Early Access</h2>

        {/* e-mail */}
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          className="w-full rounded border px-3 py-2 focus:outline-none"
          required
        />

        {/* wallet connect */}
        <button
          type="button"
          onClick={async () => {
            const addr = await (onConnectWallet?.() || '');
            if (addr) setXrpAddr(addr);
          }}
          className="w-full rounded bg-blue-600 px-3 py-2 text-white"
        >
          {xrpAddr ? 'Wallet Connected' : 'Connect Xumm Wallet'}
        </button>

        {error  && <p className="text-red-600">{error}</p>}
        {status && <p className="text-green-600">{status}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`rounded px-4 py-2 ${
              canSubmit
                ? 'bg-matrix-green text-black'
                : 'bg-matrix-green/40 cursor-not-allowed'
            }`}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
