'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '../components/Hero';
import OpenClawBanner from '../components/OpenClawBanner';
import Features from '../components/Features';
import EmailSignupForm from '../components/EmailSignupForm';
import JobTemplateForm from '../components/JobTemplateForm';
import { connectXummInteractive } from '../lib/xummConnectClient';

export default function Home() {
  const router = useRouter();

  const [showSignup, setShowSignup] = useState(false);
  const [showForm,   setShowForm]   = useState(false);

  /* ───── e-mail modal ───── */
  const handleOpenSignup  = () => setShowSignup(true);
  const handleCloseSignup = () => setShowSignup(false);

  const handleSignup = () => {
    setShowSignup(false);
    setShowForm(true);
  };

  /* ───── job template modal ───── */
  const handleCloseForm  = () => setShowForm(false);

  const handleFormSubmit = () => {
    // later we’ll POST job & escrow … for now just open lobby
    setShowForm(false);
    router.push('/hire/lobby');
  };

  return (
    <>
      {showSignup && (
        <EmailSignupForm
          onSignUp={handleSignup}
          onClose={handleCloseSignup}
        />
      )}

      {showForm && (
        <JobTemplateForm
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
          onConnectWallet={async () => {
            try {
              const acct = await connectXummInteractive();
              return acct;          // shows “Wallet Connected”
            } catch (err) {
              console.error(err);
              alert('Wallet connect failed or timed out.');
              return '';
            }
          }}
        />
      )}

              {/* OpenClaw promotion banner */}
      <OpenClawBanner />

      <Hero onGetStarted={handleOpenSignup} />
      <Features />
    </>
  );
}
