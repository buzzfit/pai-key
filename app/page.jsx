// app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import JobTemplateForm from '../components/JobTemplateForm';
+ import EmailSignupForm from '../components/EmailSignupForm';

export default function Home() {
- const [showForm, setShowForm] = useState(false);
+ const [showSignup, setShowSignup] = useState(false);
+ const [showForm, setShowForm] = useState(false);
+ const [signedUp, setSignedUp] = useState(false);

  // On mount, check localStorage
  useEffect(() => {
-   // nothing
+   if (localStorage.getItem('paiKeySignedUp') === 'true') {
+     setSignedUp(true);
+   }
  }, []);

  // handle email signup
+ const handleSignUp = email => {
+   console.log('Signed up:', email);
+   setSignedUp(true);
+   setShowSignup(false);
+   // now open job template
+   setShowForm(true);
+ };

  // open the job template or signup
- const handleOpenForm = () => setShowForm(true);
+ const handleOpenForm = () => {
+   if (signedUp) {
+     setShowForm(true);
+   } else {
+     setShowSignup(true);
+   }
+ };

  const handleCloseForm = () => setShowForm(false);
+ const handleCloseSignup = () => setShowSignup(false);

  const handleFormSubmit = data => {
    console.log('Job Template Data:', data);
    setShowForm(false);
  };

  return (
    <>
+     {/* Signup Modal */}
+     {showSignup && (
+       <EmailSignupForm
+         onSignUp={handleSignUp}
+         onClose={handleCloseSignup}
+       />
+     )}

      {/* Job Template Modal */}
      {showForm && (
        <JobTemplateForm
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {/* Main content */}
-     <Hero onGetStarted={handleOpenForm} />
+     <Hero onGetStarted={handleOpenForm} />
      <Features />
    </>
  );
}
