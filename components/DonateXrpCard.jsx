// components/DonateXrpCard.jsx
'use client';

export default function DonateXrpCard({ addr }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(addr)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(addr);
      alert('Address copied to clipboard.');
    } catch {
      prompt('Copy address:', addr);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,280px] items-start">
      {/* Address + actions */}
      <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6">
        <p className="text-matrix-green/80 mb-2">
          Thank you for supporting development. Donations go to the project wallet:
        </p>

        <div className="flex items-center gap-3">
          <code className="select-all break-all rounded-md border border-matrix-green/30 bg-black/40 px-3 py-2 font-mono text-sm text-matrix-green/90">
            {addr}
          </code>
          <button
            onClick={copy}
            className="rounded-md bg-matrix-green px-3 py-2 text-black hover:opacity-90"
          >
            Copy
          </button>
        </div>

        <details className="mt-4 rounded-md border border-matrix-green/20 bg-black/30 p-3">
          <summary className="cursor-pointer text-matrix-green/90">Help / Tips</summary>
          <ul className="mt-3 list-disc ml-5 space-y-2 text-matrix-green/80 text-sm">
            <li>
              This is a classic XRP address (starts with <code>r</code>). Most wallets can send to it directly.
            </li>
            <li>
              If an exchange asks for a destination tag, leave it blank for this donation wallet or send from your own wallet (e.g., Xaman).
            </li>
            <li>
              Optional: add a memo like <em>PAI-Key Donation</em> in your wallet.
            </li>
          </ul>
        </details>
      </div>

      {/* QR */}
      <div className="rounded-2xl border border-matrix-green/25 bg-gray-900/40 p-6 text-center">
        <img
          alt="XRP donation QR"
          src={qrUrl}
          className="mx-auto h-60 w-60 rounded-lg border border-matrix-green/20 bg-white p-2"
          loading="lazy"
        />
        <div className="mt-3 text-sm text-matrix-green/80">
          Scan to copy address in a wallet that supports scanning.
        </div>
      </div>
    </div>
  );
}
