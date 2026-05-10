"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  analyzeError,
  ErrorGroup,
  fetchErrorGroups,
  fetchProject,
  Project,
} from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { useAuthToken } from "@/lib/auth";
import { Header } from "@/app/components/header";
import { Footer } from "@/app/components/footer";
import { SkeletonCard, SkeletonErrorRow } from "@/app/components/skeleton";

type LoadState = "loading" | "ready" | "error";

export default function ProjectDetailPage() {
  const token = useAuthToken();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [errors, setErrors] = useState<ErrorGroup[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [notice, setNotice] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const snippet = useMemo(() => {
    if (!project) return "";
    return `import { initLogger } from "@stackpilot/sdk";

initLogger({
  projectKey: "${project.projectKey}",
  endpoint: "${API_BASE_URL}/logs"
});`;
  }, [project]);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} — StackPilot`;
    }
  }, [project]);

  useEffect(() => {
    if (!token) {
      window.location.replace("/");
      return;
    }
    let cancelled = false;

    const loadProject = async () => {
      setState("loading");
      try {
        const [projectResult, errorResult] = await Promise.all([
          fetchProject(projectId),
          fetchErrorGroups(projectId),
        ]);
        if (!cancelled) {
          setProject(projectResult);
          setErrors(errorResult.errors);
          setState("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setState("error");
          setNotice(error instanceof Error ? error.message : "Failed to load project");
        }
      }
    };

    loadProject();
    return () => { cancelled = true; };
  }, [projectId, token]);

  useEffect(() => {
    if (!token) return;
    const interval = window.setInterval(async () => {
      try {
        const result = await fetchErrorGroups(projectId);
        setErrors(result.errors);
      } catch {
        // Keep the current detail view visible during transient refresh errors.
      }
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [projectId, token]);

  const handleAnalyzeError = async (errorGroup: ErrorGroup) => {
    setAnalyzingId(errorGroup._id);
    try {
      const result = await analyzeError({
        message: errorGroup.message,
        route: errorGroup.route,
      });
      setErrors((current) =>
        current.map((e) =>
          e._id === errorGroup._id
            ? { ...e, ...result, aiAnalyzed: "done" as const }
            : e
        )
      );
      setNotice("AI analysis complete.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const copyText = async (value: string, label: string) => {
    try {
      await window.navigator.clipboard.writeText(value);
      setNotice(`${label} copied.`);
    } catch {
      setNotice("Copy failed. Select the text manually.");
    }
  };

  if (state === "loading") {
    return (
      <div className="flex min-h-screen flex-col bg-[#f6f7f9]">
        <Header showDashboard />
        <main className="flex-1">
          <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
            <SkeletonCard />
            <SkeletonCard />
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (state === "error" || !project) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f6f7f9]">
        <Header showDashboard />
        <main className="flex-1 px-6 py-10">
          <section className="mx-auto max-w-3xl rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm animate-fade-in">
            <p className="text-sm font-semibold text-[#b42318]">
              {notice || "Project could not be loaded."}
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-10 items-center rounded-md border border-[#d8dde5] px-3 text-sm font-semibold"
            >
              Back to dashboard
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9] text-[#15171a]">
      <Header showDashboard />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
          {notice && (
            <div className="rounded-lg border border-[#d9dee7] bg-white px-4 py-3 text-sm text-[#475467] animate-fade-in">
              {notice}
            </div>
          )}

          {/* Project info */}
          <div className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm animate-slide-up">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">Project</p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
                <a
                  href={project.repoUrl}
                  className="mt-3 block break-all text-sm font-medium text-[#175cd3] hover:underline"
                  rel="noreferrer"
                  target="_blank"
                >
                  {project.repoUrl}
                </a>
              </div>
              <button
                type="button"
                onClick={() => copyText(project.projectKey, "Project key")}
                className="rounded-md border border-[#d8dde5] bg-[#f7f8fa] px-3 py-2 text-left font-mono text-xs text-[#303741] transition hover:border-[#b8c0cc]"
              >
                {project.projectKey}
              </button>
            </div>
          </div>

          {/* SDK setup */}
          <div className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">Install</p>
                <h2 className="mt-2 text-xl font-semibold">SDK setup</h2>
              </div>
              <button
                type="button"
                onClick={() => copyText(snippet, "SDK snippet")}
                className="h-10 rounded-md border border-[#d8dde5] px-3 text-sm font-semibold transition hover:bg-[#f7f8fa]"
              >
                Copy
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-md bg-[#111316] p-4 text-sm leading-6 text-white">
              <code>{snippet}</code>
            </pre>
          </div>

          {/* Errors */}
          <div className="rounded-lg border border-[#d9dee7] bg-white shadow-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="border-b border-[#edf0f4] px-6 py-4">
              <h2 className="text-xl font-semibold">Latest grouped errors</h2>
            </div>
            {errors.length === 0 ? (
              <p className="px-6 py-10 text-sm leading-6 text-[#667085]">
                No grouped errors yet. Once the SDK sends logs, new groups appear here automatically.
              </p>
            ) : (
              <div className="divide-y divide-[#edf0f4]">
                {errors.map((error) => (
                  <article key={error._id} className="px-6 py-5 transition-colors hover:bg-[#fbfcfd]">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={severityClassName(error.severity)}>
                            {error.severity}
                          </span>
                          <span className="rounded-md bg-[#eef4ff] px-2 py-1 text-xs font-semibold text-[#175cd3]">
                            {error.aiAnalyzed}
                          </span>
                          {error.type && (
                            <span className="rounded-md bg-[#f2f4f7] px-2 py-1 text-xs font-semibold text-[#475467]">
                              {error.type}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold">{error.message}</p>
                        <p className="mt-1 text-sm text-[#667085]">
                          {error.route || "Route not provided"} - {error.count} event{error.count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {error.aiAnalyzed !== "done" && (
                          <button
                            type="button"
                            disabled={analyzingId === error._id}
                            onClick={() => handleAnalyzeError(error)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8dde5] bg-white px-3 text-xs font-semibold text-[#303741] transition hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {analyzingId === error._id ? (
                              <>
                                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                                </svg>
                                Analyzing...
                              </>
                            ) : (
                              "Analyze"
                            )}
                          </button>
                        )}
                        <span className="rounded-md bg-[#f2f4f7] px-2 py-1 text-xs font-semibold text-[#475467]">
                          {error.aiAnalyzed}
                        </span>
                      </div>
                    </div>
                    {error.cause && (
                      <p className="mt-3 text-sm leading-6 text-[#303741]">{error.cause}</p>
                    )}
                    {error.fix?.length ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#475467]">
                        {error.fix.map((fix) => (
                          <li key={fix}>{fix}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function severityClassName(severity: ErrorGroup["severity"]) {
  const base = "rounded-md px-2 py-1 text-xs font-semibold";
  if (severity === "high") return `${base} bg-[#fdecec] text-[#b42318]`;
  if (severity === "medium") return `${base} bg-[#fff7e6] text-[#a15c07]`;
  return `${base} bg-[#ecfdf3] text-[#027a48]`;
}
