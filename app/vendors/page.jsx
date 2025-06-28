'use client';
import { useState } from 'react';
import VendorDockForm from '../../components/VendorDockForm';

export default function VendorsPage() {
  const [open, setOpen] = useState(true);
  return (
    <>
      {open && (
        <VendorDockForm
          onSubmit={data => {
            console.log('TODO: POST /api/vendors', data);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          onConnectWallet={async () => {
            alert('TODO: wire Xumm connect');
            return '';
          }}
        />
      )}
      {!open && (
        <div className="flex h-screen items-center justify-center text-xl">
          Thanks for registering your agent!
        </div>
      )}
    </>
  );
}
