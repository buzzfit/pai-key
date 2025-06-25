'use client';

import { useState, useEffect } from 'react';
import { init } from '@emailjs/browser';

export default function EmailSignupForm({ onSignUp, onClose }) {
  // Initialize EmailJS once on mount
  useEffect(() => {
    init(process.env.NEXT_PUBLIC_EMAILJS_USER_ID);
  }, []);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    // Basic email regex
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    // Persist signup state
    localStorage.setItem('paiKeySignedUp', 'true');
    localStorage.setItem('paiKeyEmail', email);
    onSignUp(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-black">Sign Up for Early Access</h2>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          className="w-full px-3 py-2 border rounded-md focus:outline-none"
          required
        />
        {error && <p className="text-red-600">{error}</p>}
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
            className="px-4 py-2 bg-matrix-green text-black rounded-md hover:opacity-90"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
