// app/page.jsx
'use client';

import { useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import JobTemplateForm from '../components/JobTemplateForm';

export default function Home() {
  // state to control whether the Job Template modal is visible
  const [showForm, setShowForm] = useState(false);

  // open the form
  const handleOpenForm = () => setShowForm(true);

  // close the form
  const handleCloseForm = () => setShowForm(false);

  // handle submit from the form
  const handleFormSubmit = (data) => {
    console.log('Job Template Data:', data);
    // TODO: wire this up to your backend / XRPL flow
    setShowForm(false);
  };

  return (
    <>
      {/* Job Template Modal */}
      {showForm && (
        <JobTemplateForm
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* Main content */}
      <Hero onGetStarted={handleOpenForm} />
      <Features />
    </>
  );
}
