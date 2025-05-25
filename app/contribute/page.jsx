// app/contribute/page.jsx
export default function ContributePage() {
  return (
    <main className="min-h-screen bg-black text-matrix-green p-8">
      <h1 className="text-4xl font-bold mb-4">Contribute</h1>
      <p className="text-lg">
        Help us drive PAI Key forward: join our community, review issues, propose PRs, or email us at{' '}
        <a href="mailto:admin@pai-key.org" className="underline">
          admin@pai-key.org
        </a>.
      </p>
    </main>
  );
}
