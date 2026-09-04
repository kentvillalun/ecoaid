import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";

export default function Forbidden() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <div className="max-w-md">
        {/* <LockClosedIcon className="mx-auto h-10 w-10 text-accent" /> */}
        <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-accent">
          EcoAid
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">
          Access Denied
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Your account role doesn&apos;t have permission to view this page.
        </p>
      </div>

      {/* <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="rounded-2xl gradient-button px-5 py-3 text-white transition-opacity hover:opacity-90"
        >
          Back to Dashboard
        </Link>
      </div> */}
    </main>
  );
}
