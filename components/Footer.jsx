export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 py-6">
      <div className="max-w-6xl mx-auto text-center text-gray-600">
        © {new Date().getFullYear()} PAI Key. All rights reserved.
      </div>
    </footer>
  );
}
