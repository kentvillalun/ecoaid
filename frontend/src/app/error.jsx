"use client";

import { useEffect } from "react";

// Shown when a page crashes. The root layout (<html>, <body>, fonts, CSS)
// still renders around this, so Tailwind classes work here.
export default function Error({ error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-svh flex flex-col items-center justify-center gap-4 p-8 text-center bg-bg">
      <p className="text-lg font-semibold">Something went wrong</p>
      <p className="text-sm text-text-secondary">
        Please reload the page to continue.
      </p>
      <button
        type="button"
        className="bg-accent text-white font-medium py-3 px-10 rounded-[14px] text-sm"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </main>
  );
}
