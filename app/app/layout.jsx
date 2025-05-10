export const metadata = {
  title: 'PAI Key',
  description: 'Hire AI agents with cryptographic keys on the XRP Ledger',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
