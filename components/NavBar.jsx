/*
Project: pai-key-site marketing site
Stack: Next.js 13 (App Router) + Tailwind CSS + React

We’re adding an XRPL Hooks Amendments Status page and a nav link.
*/

// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep matrix green accent
        'matrix-green': '#00AA2B',
        'matrix-dark': '#0f0f0f',
      },
    },
  },
  plugins: [],
};

// components/NavBar.jsx
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav role="navigation" aria-label="Main navigation" className="w-full bg-black shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        {/* Logo */}
        <Link href="/" passHref>
          <a className="text-2xl font-extrabold text-matrix-green hover:text-green-300">PAI Key</a>
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <Link href="/" passHref>
            <a className="transition hover:text-matrix-green cursor-pointer">Home</a>
          </Link>
          <Link href="/#features" passHref>
            <a className="transition hover:text-matrix-green cursor-pointer">Features</a>
          </Link>
          <Link href="/whitepaper" passHref>
            <a className="transition hover:text-matrix-green cursor-pointer">Whitepaper</a>
          </Link>
          <Link href="/features/least-authority-keys" passHref>
            <a className="transition hover:text-matrix-green cursor-pointer">Details</a>
          </Link>
          <Link href="/hooks-amendments" passHref>
            <a className="transition hover:text-matrix-green cursor-pointer">Amendments</a>
          </Link>
          <a
            href="https://github.com/buzzfit/pai-key"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-matrix-green cursor-pointer"
          >
            GitHub
          </a>
          <Link href="https://app.pai-key.org" passHref>
            <a className="px-4 py-2 bg-matrix-green text-black rounded-md hover:bg-opacity-90 transition cursor-pointer">
              Get Started
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// app/hooks-amendments/page.jsx
export const metadata = {
  title: 'XRPL Hooks Amendments Status – PAI Key',
  description: 'Track the status of Hooks amendments on the XRP Ledger within the PAI Key ecosystem.'
};

export default function HooksAmendmentsPage() {
  return (
    <article className="max-w-3xl mx-auto py-16 px-4 prose prose-lg dark:prose-invert">
      <h1>XRPL Hooks Amendments Status</h1>
      <p>
        Stay up-to-date with the latest XRPL Hooks amendments—these on-chain scripts enable PAI Key’s
        automated escrow and freeze logic once fully deployed.
      </p>
      <h2>Monitoring Known Amendments</h2>
      <p>
        We regularly check the XRPL <a href="https://xrpl.org/known-amendments.html" className="text-matrix-green hover:underline">Known Amendments</a>
        page for the current status of the Hooks amendment and related proposals.
      </p>
      <h2>Subscribe for Updates</h2>
      <p>
        Join the <a href="https://xrpl.org/community/" className="text-matrix-green hover:underline">XRPL Developers mailing list</a>
        or follow the XRP Ledger GitHub repo to get notified when Hooks moves from Draft to Enabled.
      </p>
      <h2>Next Steps for PAI Key</h2>
      <ul>
        <li>Implement on-chain HookCreate transactions when the amendment is enabled.</li>
        <li>Deploy smart watchers to auto-fulfill escrow based on proof conditions.</li>
        <li>Enable freeze-AI emergency Hooks to protect user funds.</li>
      </ul>
    </article>
  );
}
