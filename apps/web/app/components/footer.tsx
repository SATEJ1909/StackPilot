import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--sp-border)] glass">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        <p className="text-sm text-[#667085]">
          &copy; {new Date().getFullYear()} StackPilot. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-[#667085] transition hover:text-[#15171a]"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#667085] transition hover:text-[#15171a]"
          >
            Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#667085] transition hover:text-[#15171a]"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
