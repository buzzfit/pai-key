'use client';

import { useState, useEffect } from 'react';
import { init, send } from '@emailjs/browser';

export default function EmailSignupForm({ onSignUp, onClose }) {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Initialize EmailJS on mount with your Public Key (User ID)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    init('qw2tG7e_AKMJ2Ml_y'); // ← replace with your EmailJS Public Key
  }, []);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Handle the form submission and send both emails via your SMTP service
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email regex
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    setError('');
    setStatus('Sending…');

    try {
      // 2a) Notify Admin
      await send(
        'service_pai_smtp',              // ← your new SMTP Service ID
        'template_admin_notify',         // ← your admin‐notify template ID
        { user_email: email }
      );

      // 2b) Send Confirmation to User
      await send(
        'service_pai_smtp',              // ← same SMTP Service ID
        'template_user_confirm',         // ← your user‐confirm template ID
        { user_email: email }
      );

      // 2c) Persist and proceed
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-black">
          Sign Up for Early Access
        </h2>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          className="w-full px-3 py-2 border rounded-md focus:outline-none"
          required
        />

        {error && <p className="text-red-600">{error}</p>}
        {status && <p className="text-green-600">{status}</p>}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-matrix-green text-black rounded-md hover:opacity-90 transition"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
