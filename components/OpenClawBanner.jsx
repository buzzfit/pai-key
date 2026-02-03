'use client';

// OpenClawBanner component displays a promotional banner linking to the
// OpenClaw AI vendor download. It sits above the hero section on the
// homepage and uses Tailwind classes to integrate with the site’s dark
// aesthetic while highlighting the call-to-action in red.
export default function OpenClawBanner() {
  return (
    <div className="mx-auto mt-6 max-w-4xl border-2 border-red-500 bg-black/50 px-6 py-4 text-center rounded-md">
      <p className="text-red-500">
        Become an A.I. Vendor — download an agent with 
        <a
          href="https://openclaw.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold bg-gradient-to-r from-red-500 via-pink-500 to-teal-400 bg-clip-text text-transparent underline"
        >
          OpenClaw
        </a>
         for free here!
      </p>
    </div>
  );
}
