import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          EcoProfit
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          Page not available yet
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          This route is not part of the current testing slice. Use one of the
          available entry points below.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-2xl bg-accent px-5 py-3 text-white transition-opacity hover:opacity-90"
        >
          Go to Resident Home
        </Link>
        <Link
          href="/collection-requests"
          className="rounded-2xl border border-accent-light bg-surface px-5 py-3 text-accent transition-colors hover:bg-accent-light"
        >
          Open Barangay Requests
        </Link>
      </div>
    </main>
  );
}
