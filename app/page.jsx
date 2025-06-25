// app/page.jsx
'use client';

import { useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import EmailSignupForm from '../components/EmailSignupForm';
import JobTemplateForm from '../components/JobTemplateForm';

export default function Home() {
  // Step 1: show the email signup modal
  const [showSignup, setShowSignup] = useState(false);
  // Step 2: once signed up, show the job template modal
  const [showForm, setShowForm] = useState(false);

  // Open signup when the "Get Started" button is clicked
  const handleOpenSignup = () => setShowSignup(true);
  // Close signup without proceeding
  const handleCloseSignup = () => setShowSignup(false);
  // After successful signup, close signup & open the job form
  const handleSignup = (email) => {
    console.log('Signed up:', email);
    setShowSignup(false);
    setShowForm(true);
  };

  // Close or cancel the job template form
  const handleCloseForm = () => setShowForm(false);
  // Handle form submission (stubbed for now)
  const handleFormSubmit = (data) => {
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
        />
      )}

      {/* 3) Main page */}
      <Hero onGetStarted={handleOpenSignup} />
      <Features />
    </>
  );
}
