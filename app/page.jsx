// app/page.jsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Hero from '../components/Hero';
import Features from '../components/Features';
import JobTemplateForm from '../components/JobTemplateForm';

export default function Home() {
  // read ?form=true query param
  const params = useSearchParams();
  const initialShow = params.get('form') === 'true';

  // state to control whether the Job Template modal is visible
  const [showForm, setShowForm] = useState(initialShow);

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
