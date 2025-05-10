// components/NavBar.jsx
export default function NavBar() {
  return (
    <nav role="navigation" aria-label="Main navigation" className="w-full bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">PAI Key</a>
        <div className="flex space-x-6">
          <a href="/" className="hover:underline">Home</a>
          <a href="#features" className="hover:underline">Features</a>
          <a href="/whitepaper" className="hover:underline">Whitepaper</a>
          <a href="https://github.com/buzzfit/pai-key" className="hover:underline">GitHub</a>
          <a href="https://app.pai-key.org" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
