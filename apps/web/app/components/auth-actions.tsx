"use client";

import { GITHUB_AUTH_URL } from "@/lib/config";
import { useAuthToken } from "@/lib/auth";
import { useState } from "react";

export function AuthActions() {
  const hasSession = Boolean(useAuthToken());
  const [isStarting, setIsStarting] = useState(false);
  const label = hasSession
    ? "Open dashboard"
    : isStarting
      ? "Redirecting to GitHub..."
      : "Continue with GitHub";

  return (
    <div className="flex flex-col gap-3">
      <a
        href={hasSession ? "/dashboard" : GITHUB_AUTH_URL}
        onClick={() => {
          if (!hasSession) {
            setIsStarting(true);
          }
        }}
        aria-busy={isStarting}
        className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#15171a] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2b2f35] focus:outline-none focus:ring-2 focus:ring-[#15171a] focus:ring-offset-2"
      >
        {hasSession ? <DashboardIcon /> : <GitHubIcon />}
        {label}
      </a>
      <p className="text-sm leading-6 text-[#667085]">
        Secure GitHub OAuth with a 7-day StackPilot session.
      </p>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18.92-.26 1.9-.38 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.16c0 .31.21.68.79.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 5a1 1 0 0 1 1-1h6v7H4V5Z" />
      <path d="M13 4h6a1 1 0 0 1 1 1v4h-7V4Z" />
      <path d="M4 13h7v7H5a1 1 0 0 1-1-1v-6Z" />
      <path d="M13 11h7v8a1 1 0 0 1-1 1h-6v-9Z" />
    </svg>
  );
}
