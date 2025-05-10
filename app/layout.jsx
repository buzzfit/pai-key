// app/layout.jsx
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'PAI Key',
  description: 'Hire AI agents with cryptographic keys on the XRP Ledger',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
