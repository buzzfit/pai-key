// app/page.jsx
'use client';

import { useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import EmailSignupForm from '../components/EmailSignupForm';
import JobTemplateForm from '../components/JobTemplateForm';

export default function Home() {
  const [showSignup, setShowSignup] = useState(false);
  const [showForm,   setShowForm]   = useState(false);

  const handleOpenSignup  = () => setShowSignup(true);
  const handleCloseSignup = () => setShowSignup(false);

  const handleSignup = email => {
    console.log('Signed up:', email);
    setShowSignup(false);
    setShowForm(true);
  };

  const handleCloseForm   = () => setShowForm(false);
  const handleFormSubmit  = data => {
    console.log('Job Template submitted:', data);
    setShowForm(false);
  };

  return (
    <>
      {/* 1) Email signup modal */}
      {showSignup && (
        <EmailSignupForm
          onSignUp={handleSignup}
          onClose={handleCloseSignup}
        />
      )}

      {/* 2) Job template modal */}
      {showForm && (
        <JobTemplateForm
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
          /** ───── ADD THIS PROP ───── **/
          onConnectWallet={async () => {
            // the same placeholder pop-down used elsewhere
            alert('TODO: wire Xumm connect');
            return '';            // later: return XRPL address string
          }}
        />
      )}

      {/* 3) Main page */}
      <Hero      onGetStarted={handleOpenSignup} />
      <Features />
    </>
  );
}
