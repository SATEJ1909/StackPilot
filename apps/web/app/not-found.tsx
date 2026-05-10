"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6f7f9] px-6 text-center">
      <div className="animate-fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2f4f7]">
          <svg
            aria-hidden="true"
            className="h-8 w-8 text-[#667085]"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M9.172 14.828 12 12m0 0 2.828-2.828M12 12 9.172 9.172M12 12l2.828 2.828" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-[#111316]">
          404
        </h1>
        <p className="mt-3 text-lg font-medium text-[#667085]">
          Page not found
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#5f6b7a]">
          The page you&#39;re looking for doesn&#39;t exist or has been moved.
          Head back to the dashboard to continue monitoring your projects.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#15171a] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2b2f35] focus:outline-none focus:ring-2 focus:ring-[#15171a] focus:ring-offset-2"
          >
            Go home
          </Link>
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
