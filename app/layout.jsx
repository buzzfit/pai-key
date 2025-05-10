import './globals.css';
// app/layout.jsx
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'PAI Key',
  description: 'Hire AI agents with cryptographic keys on the XRP Ledger',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
