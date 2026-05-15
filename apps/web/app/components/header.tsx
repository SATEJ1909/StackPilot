"use client";

import Link from "next/link";
import { clearToken, useAuthToken } from "@/lib/auth";
import { LayoutDashboard, LogOut } from "lucide-react";

interface HeaderProps {
  showSignOut?: boolean;
  showDashboard?: boolean;
}

export function Header({ showSignOut = false, showDashboard = false }: HeaderProps) {
  const token = useAuthToken();
  const signedIn = Boolean(token);

  return (
    <header className="sticky top-0 z-50 glass">
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--sp-border-input)] bg-white px-4 text-sm font-semibold text-[var(--sp-text-label)] transition-all duration-200 hover:border-[var(--sp-border)] hover:bg-gray-50 hover:text-[var(--sp-text)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <LayoutDashboard className="h-4 w-4" />
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--sp-border-input)] bg-white px-4 text-sm font-semibold text-[var(--sp-text-label)] transition-all duration-200 hover:border-[var(--sp-border)] hover:bg-red-50 hover:text-red-600 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
