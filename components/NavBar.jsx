export default function NavBar() {
  return (
    <nav className="w-full bg-white shadow">
      <div className="max-w-6xl mx-auto p-4 flex items-center">
        <a href="/" className="text-xl font-bold">PAI Key</a>
        <div className="flex ml-auto">
          <a href="/" className="mx-4 hover:underline">Home</a>
          <a href="#features" className="mx-4 hover:underline">Features</a>
          <a href="https://github.com/buzzfit/pai-key" className="mx-4 hover:underline">GitHub</a>
          <a
            href="https://app.pai-key.org"
            className="mx-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

