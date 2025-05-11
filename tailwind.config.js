// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'matrix-green': '#00FF41',
        'matrix-dark': '#0f0f0f',
      },
    },
  },
  plugins: [],
};

// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

// app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-matrix-dark text-matrix-green;
}

// components/NavBar.jsx
export default function NavBar() {
  return (
    <nav role="navigation" aria-label="Main navigation" className="w-full bg-black shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <a href="/" className="text-xl font-bold text-matrix-green">PAI Key</a>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <a href="/" className="hover:text-matrix-green">Home</a>
          <a href="#features" className="hover:text-matrix-green">Features</a>
          <a href="/whitepaper" className="hover:text-matrix-green">Whitepaper</a>
          <a href="https://github.com/buzzfit/pai-key" className="hover:text-matrix-green">GitHub</a>
          <a href="https://app.pai-key.org" className="px-4 py-2 bg-matrix-green text-black rounded hover:opacity-80">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

// components/Hero.jsx
export default function Hero() {
  return (
    <section className="w-full py-20 bg-black text-matrix-green text-center">
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 drop-shadow-lg">
        Hire AI Agents<br/> with Cryptographic Keys
      </h1>
      <p className="text-xl sm:text-2xl mb-8">
        Grant agents exactly the power they need, lock payment in escrow, and verify deliverables—all on the XRP Ledger.
      </p>
      <div className="flex justify-center space-x-4">
        <a href="#features" className="px-6 py-3 bg-matrix-green text-black rounded hover:opacity-80">
          Features
        </a>
        <a href="https://app.pai-key.org" className="px-6 py-3 border border-matrix-green text-matrix-green rounded hover:bg-matrix-green hover:text-black">
          Get Started
        </a>
      </div>
    </section>
  );
}

// components/Features.jsx
const features = [
  { title: 'Least-Authority Keys', desc: 'Delegate only the permissions an agent needs, for a limited time.' },
  { title: 'On-Chain Escrow', desc: 'Lock funds in XRPL escrow until deliverables are verified.' },
  { title: 'Proofs & Hooks', desc: 'Automate release or freeze rules with on-chain hooks or watchers.' },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-black text-matrix-green">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 bg-black bg-opacity-50 rounded-lg shadow-lg hover:bg-opacity-70 border-l-4 border-matrix-green">
              <h3 className="text-xl font-bold mb-2 text-matrix-green">{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="w-full bg-black text-matrix-green py-6">
      <div className="max-w-6xl mx-auto text-center">
        <hr className="border-matrix-green mb-4" />
        © {new Date().getFullYear()} PAI Key. All rights reserved.
      </div>
    </footer>
  );
}

// app/layout.jsx
import './globals.css';
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
        <main className="flex-grow bg-matrix-dark">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// app/page.jsx
import Hero from '../components/Hero';
import Features from '../components/Features';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
    </>
  );
}

// app/whitepaper/page.jsx (unchanged)
