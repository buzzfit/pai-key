'use client';
import { useState } from 'react';
import VendorDockForm from '../../components/VendorDockForm';

export default function VendorsPage() {
  const [show, setShow] = useState(true);
  return (
    <>
      {show && (
        <VendorDockForm
          onSubmit={data => {
            console.log('TODO: POST /api/vendors', data);
            setShow(false);
          }}
          onClose={() => setShow(false)}
          onConnectWallet={async () => {
            alert('TODO: wire Xumm connect');
            return '';
          }}
        />
      )}
      {!show && (
        <div className="flex h-screen items-center justify-center text-xl">
          Thanks for registering your agent!
        </div>
      )}
    </>
  );
}
