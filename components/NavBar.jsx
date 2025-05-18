// components/NavBar.jsx
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav role="navigation" aria-label="Main navigation" className="w-full bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        {/* Logo */}
        <Link href="/" passHref>
          <a className="text-2xl font-extrabold text-matrix-green hover:text-matrix-green">
            PAI Key
          </a>
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <Link href="/" passHref>
            <a className="cursor-pointer transition hover:text-matrix-green">Home</a>
          </Link>
          <a
            href="mailto:admin@pai-key.org"
            className="cursor-pointer transition hover:text-matrix-green"
          >
            Contact
          </a>
          <Link href="/whitepaper" passHref>
            <a className="cursor-pointer transition hover:text-matrix-green">Whitepaper</a>
          </Link>
          <Link href="/features/least-authority-keys" passHref>
            <a className="cursor-pointer transition hover:text-matrix-green">Details</a>
          </Link>
          <Link href="/hooks-amendments" passHref>
            <a className="cursor-pointer transition hover:text-matrix-green">Amendments</a>
          </Link>
          <Link href="https://github.com/buzzfit/pai-key" passHref>
            <a
              className="cursor-pointer transition hover:text-matrix-green"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </Link>
        </div>
      </div>
    </nav>
);
}
