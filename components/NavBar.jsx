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
          <a className="text-2xl font-extrabold tracking-wider text-matrix-green">
            PAI<span className="opacity-60">_</span>Key
          </a>
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8">

          {[
            { label: 'Home', href: '/' },
            { label: 'Contact', href: 'mailto:admin@pai-key.org', external: true },
            { label: 'Whitepaper', href: '/whitepaper' },
            { label: 'Overview', href: '/overview' },
            { label: 'Contribute', href: '/contribute' },
            { label: 'GitHub', href: 'https://github.com/buzzfit/pai-key', external: true },
          ].map(({ label, href, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="nav-link"
              >
                {label}
              </a>
            ) : (
              <Link key={label} href={href} passHref>
                <a className="nav-link">{label}</a>
              </Link>
            )
          )}

        </div>
      </div>

      {/* Inline styles keep this self-contained */}
      <style jsx>{`
        .nav-link {
          position: relative;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9ca3af; /* gray-400 */
          padding: 0.25rem 0;
          transition: color 120ms ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0%;
          height: 2px;
          background-color: #00ff41;
          transition: width 140ms ease;
        }

        .nav-link:hover {
          color: #00ff41;
        }

        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
}
