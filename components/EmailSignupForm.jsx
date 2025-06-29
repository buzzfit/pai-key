// components/EmailSignupForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { init, send } from '@emailjs/browser';

export default function EmailSignupForm({ onSignUp, onClose }) {
  /* 1️⃣  initialise EmailJS once */
  useEffect(() => {
    init('qw2tG7e_AKMJ2Ml_y');          // ← your Public Key
  }, []);

  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [status, setStatus] = useState('');

  /* 2️⃣  handle submit */
  const handleSubmit = async e => {
    e.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setError('');
    setStatus('Sending…');

    try {
      /* 2a – notify admin */
      await send('service_pai_smtp', 'template_admin_notify', {
        user_email: email,
      });

      /* 2b – welcome user */
      await send('service_pai_smtp', 'template_user_confirm', {
        user_email: email,
      });

      /* 2c – persist & continue */
      localStorage.setItem('paiKeySignedUp', 'true');
      localStorage.setItem('paiKeyEmail', email);
      setStatus('Success! Check your inbox.');
      onSignUp(email);
    } catch (err) {
      console.error('EmailJS error:', err);
      setError('Failed to send emails. Please try again later.');
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-md bg-white p-6"
      >
        <h2 className="text-2xl font-bold text-black">Sign Up for Early Access</h2>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          className="w-full rounded border px-3 py-2 focus:outline-none"
          required
        />

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
            className="rounded bg-matrix-green px-4 py-2 text-black hover:opacity-90 transition"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
