"use client";

import { AuthActions } from "./components/auth-actions";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { MetricCard } from "./components/metric-card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9] text-[#111316]">
      <Header showDashboard />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-[#e1e5eb] bg-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[1fr_420px] lg:py-20">
            <div className="flex max-w-3xl flex-col justify-center animate-slide-up">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#475467]">
                AI error monitoring
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.04] tracking-normal text-[#111316] sm:text-6xl">
                Find production errors, group the noise, and ship the fix.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#56616f]">
                StackPilot captures runtime errors from your apps, groups repeat
                failures by project, and prepares an AI-assisted diagnosis your
                team can act on.
              </p>
              <div className="mt-9 max-w-md">
                <AuthActions />
              </div>
            </div>

            {/* Demo card */}
            <div className="self-center rounded-lg border border-[#d9dee7] bg-white p-5 shadow-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center justify-between border-b border-[#edf0f4] pb-4">
                <div>
                  <p className="text-sm font-bold">Checkout service</p>
                  <p className="mt-1 text-xs font-medium text-[#6b7584]">
                    production
                  </p>
                </div>
                <span className="rounded-md bg-[#fdecec] px-2.5 py-1 text-xs font-bold text-[#b42318]">
                  high
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 py-5">
                <MetricCard label="Groups" value="18" />
                <MetricCard label="Routes" value="7" />
                <MetricCard label="Status" value="ready" />
              </div>

              <div className="rounded-md border border-[#e3e8ef] bg-[#fbfcfd] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">
                  likely cause
                </p>
                <p className="mt-2 text-sm leading-6 text-[#303741]">
                  Null response from payment intent API after retry timeout.
                </p>
              </div>

              <div className="mt-4 rounded-md border border-[#e3e8ef] bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#b42318]" />
                  <div>
                    <p className="text-sm font-semibold">
                      TypeError: cannot read properties of null
                    </p>
                    <p className="mt-1 text-xs text-[#667085]">
                      /checkout · 4 min ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="setup" className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-6 md:grid-cols-3 stagger-children">
            <Feature
              title="Create a project"
              body="Sign in with GitHub, add the repository URL, and get a unique project key."
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              }
            />
            <Feature
              title="Install the logger"
              body="Use the SDK with your project key to send browser errors into the API."
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M16 18 22 12 16 6" />
                  <path d="M8 6 2 12 8 18" />
                </svg>
              }
            />
            <Feature
              title="Review AI analysis"
              body="Open the dashboard to inspect grouped errors, affected routes, and suggested fixes."
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Feature({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="group rounded-lg border border-[#d9dee7] bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#b8c0cc]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[#f2f4f7] text-[#475467] transition-colors group-hover:bg-[#15171a] group-hover:text-white">
        {icon}
      </div>
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#5f6b7a]">{body}</p>
    </article>
  );
}
