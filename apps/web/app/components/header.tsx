"use client";

import Link from "next/link";
import { clearToken, useAuthToken } from "@/lib/auth";

interface HeaderProps {
  showSignOut?: boolean;
  showDashboard?: boolean;
}

export function Header({ showSignOut = false, showDashboard = false }: HeaderProps) {
  const token = useAuthToken();
  const signedIn = Boolean(token);

  return (
    <header className="sticky top-0 z-20 border-b border-[#e1e5eb] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-black tracking-normal text-[#111316] transition-opacity hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#15171a] text-sm font-black text-white shadow-sm">
            SP
          </span>
          <span>StackPilot</span>
        </Link>

        <div className="flex items-center gap-3">
          {showDashboard && (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-md border border-[#d8dde5] bg-white px-4 text-sm font-semibold text-[#303741] transition hover:border-[#b8c0cc] hover:text-[#15171a]"
            >
              Dashboard
            </Link>
          )}

          {showSignOut && signedIn && (
            <button
              type="button"
              onClick={() => {
                clearToken();
                window.location.replace("/");
              }}
              className="h-10 rounded-md border border-[#d8dde5] bg-white px-3 text-sm font-semibold transition hover:border-[#b8c0cc]"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
