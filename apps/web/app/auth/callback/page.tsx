"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { setToken } from "@/lib/auth";

type CallbackState = "loading" | "success" | "error" | "missing";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell state="loading" />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const error = useMemo(() => searchParams.get("error"), [searchParams]);
  const state: CallbackState = error ? "error" : token ? "success" : "missing";

  useEffect(() => {
    if (error || !token) {
      return;
    }

    setToken(token);
    window.history.replaceState(null, "", "/auth/callback");

    const redirect = window.setTimeout(() => {
      router.replace("/dashboard");
    }, 450);

    return () => {
      window.clearTimeout(redirect);
    };
  }, [error, router, token]);

  return <CallbackShell state={state} />;
}

function CallbackShell({ state }: { state: CallbackState }) {
  const copy = getCopy(state);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-6 py-10 text-[#15171a]">
      <section className="w-full max-w-md rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${copy.iconClass}`}
          >
            {state === "loading" || state === "success" ? (
              <Spinner done={state === "success"} />
            ) : (
              <WarningIcon />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">
              GitHub OAuth
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#5f6b7a]">
              {copy.description}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-md border border-[#e3e8ef] bg-[#fbfcfd] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[#303741]">Provider</span>
            <span className="font-semibold">GitHub</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-medium text-[#303741]">Session</span>
            <span className={copy.statusClass}>{copy.status}</span>
          </div>
        </div>

        {state === "error" || state === "missing" ? (
          <Link
            href="/"
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-[#15171a] px-4 text-sm font-semibold text-white transition hover:bg-[#2b2f35] focus:outline-none focus:ring-2 focus:ring-[#15171a] focus:ring-offset-2"
          >
            Return to sign in
          </Link>
        ) : null}
      </section>
    </main>
  );
}

function getCopy(state: CallbackState) {
  if (state === "success") {
    return {
      title: "Sign in complete",
      description: "Your session is ready. Redirecting you to the dashboard.",
      status: "Verified",
      statusClass: "font-semibold text-[#027a48]",
      iconClass: "bg-[#ecfdf3] text-[#027a48]",
    };
  }

  if (state === "error") {
    return {
      title: "GitHub sign in failed",
      description:
        "The API could not complete the GitHub callback. Start the OAuth flow again from the home page.",
      status: "Failed",
      statusClass: "font-semibold text-[#b42318]",
      iconClass: "bg-[#fdecec] text-[#b42318]",
    };
  }

  if (state === "missing") {
    return {
      title: "Missing callback token",
      description:
        "The backend callback did not include an app session token. Check that FRONTEND_URL points to this web app.",
      status: "Incomplete",
      statusClass: "font-semibold text-[#a15c07]",
      iconClass: "bg-[#fff7e6] text-[#a15c07]",
    };
  }

  return {
    title: "Completing sign in",
    description:
      "GitHub returned to the app. We are validating the callback and preparing your session.",
    status: "Checking",
    statusClass: "font-semibold text-[#175cd3]",
    iconClass: "bg-[#eef4ff] text-[#175cd3]",
  };
}

function Spinner({ done }: { done: boolean }) {
  if (done) {
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
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

function WarningIcon() {
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
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}
