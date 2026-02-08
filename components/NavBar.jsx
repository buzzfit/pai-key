// components/NavBar.jsx
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="w-full bg-black/85 backdrop-blur-md border-b border-matrix-green/30"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" passHref>
          <a className="text-2xl font-extrabold tracking-wide text-matrix-green hover:text-matrix-green">
            PAI<span className="opacity-70">_</span>Key
          </a>
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
          
          <Link href="/" passHref>
            <a className="relative transition text-gray-300 hover:text-matrix-green">
              Home
            </a>
          </Link>

          <a
            href="mailto:admin@pai-key.org"
            className="relative transition text-gray-300 hover:text-matrix-green"
          >
            Contact
          </a>

          <Link href="/whitepaper" passHref>
            <a className="relative transition text-gray-300 hover:text-matrix-green">
              Whitepaper
            </a>
          </Link>

          <Link href="/overview" passHref>
            <a className="relative transition text-gray-300 hover:text-matrix-green">
              Overview
            </a>
          </Link>

          <Link href="/contribute" passHref>
            <a className="relative transition text-gray-300 hover:text-matrix-green">
              Contribute
            </a>
          </Link>

          <Link href="https://github.com/buzzfit/pai-key" passHref>
            <a
              className="relative transition text-gray-300 hover:text-matrix-green"
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
