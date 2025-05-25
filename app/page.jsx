// app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import JobTemplateForm from '../components/JobTemplateForm';
import EmailSignupForm from '../components/EmailSignupForm';

export default function Home() {
  const [signedUp, setSignedUp] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // On mount, check if user already signed up
  useEffect(() => {
    if (localStorage.getItem('paiKeySignedUp') === 'true') {
      setSignedUp(true);
    }
  }, []);

  // After successful signup
  const handleSignUp = (email) => {
    console.log('Signed up:', email);
    setSignedUp(true);
    setShowSignup(false);
    setShowForm(true);
  };

  // Entry point for Get Started button
  const handleOpenForm = () => {
    if (signedUp) {
      setShowForm(true);
    } else {
      setShowSignup(true);
    }
  };

  return (
    <>
      {/* Email Signup Modal */}
      {showSignup && (
        <EmailSignupForm
          onSignUp={handleSignUp}
          onClose={() => setShowSignup(false)}
        />
      )}

      {/* Job Template Modal */}
      {showForm && (
        <JobTemplateForm
          onSubmit={(data) => {
            console.log('Job Template Data:', data);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Main Page */}
      <Hero onGetStarted={handleOpenForm} />
      <Features />
    </>
  );
}
