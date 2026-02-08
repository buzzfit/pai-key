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
        <Link href="/" className="text-2xl font-extrabold tracking-wider text-matrix-green">
          PAI<span className="opacity-60">_</span>Key
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8">

          <NavItem href="/">Home</NavItem>
          <NavItem href="mailto:admin@pai-key.org">Contact</NavItem>
          <NavItem href="/whitepaper">Whitepaper</NavItem>
          <NavItem href="/overview">Overview</NavItem>
          <NavItem href="/contribute">Contribute</NavItem>
          <NavItem href="https://github.com/buzzfit/pai-key" external>
            GitHub
          </NavItem>

        </div>
      </div>
    </nav>
  );
}

/* ---------- Nav item component (pure Tailwind) ---------- */

function NavItem({ href, children, external = false }) {
  const baseClasses =
    'relative text-xs uppercase tracking-[0.18em] text-gray-400 transition-colors duration-150 ' +
    'hover:text-matrix-green';

  const underlineClasses =
    'after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 ' +
    'after:bg-matrix-green after:transition-all after:duration-150 ' +
    'hover:after:w-full';

  const className = `${baseClasses} ${underlineClasses}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
