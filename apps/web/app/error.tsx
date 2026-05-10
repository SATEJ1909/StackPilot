"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f7f9] px-6 text-center">
      <div className="animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fdecec]">
          <svg
            aria-hidden="true"
            className="h-8 w-8 text-[#b42318]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[#111316]">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#5f6b7a]">
          An unexpected error occurred. You can try again, or head back to the
          dashboard. If the issue persists, contact support.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-[#667085]">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#15171a] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2b2f35] focus:outline-none focus:ring-2 focus:ring-[#15171a] focus:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md border border-[#d8dde5] bg-white px-5 text-sm font-semibold text-[#303741] transition hover:border-[#b8c0cc]"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
