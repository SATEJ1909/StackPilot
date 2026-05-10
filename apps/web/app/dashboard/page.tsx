"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  analyzeError,
  createProject,
  deleteProject,
  ErrorGroup,
  fetchErrorGroups,
  fetchProjects,
  Project,
} from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";
import { clearToken, useAuthToken } from "@/lib/auth";
import { Header } from "@/app/components/header";
import { Footer } from "@/app/components/footer";
import { MetricCard } from "@/app/components/metric-card";
import { SkeletonCard, SkeletonErrorRow, SkeletonProjectItem } from "@/app/components/skeleton";

type LoadState = "idle" | "loading" | "ready" | "error";

export default function DashboardPage() {
  const token = useAuthToken();
  const signedIn = Boolean(token);
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ErrorGroup[]>([]);
  const [projectState, setProjectState] = useState<LoadState>("idle");
  const [errorState, setErrorState] = useState<LoadState>("idle");
  const [notice, setNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [form, setForm] = useState({ name: "", repoUrl: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project._id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);
  const visibleErrors = selectedProject ? errors : [];
  const visibleErrorState = selectedProject ? errorState : "idle";

  const filteredErrors = useMemo(() => {
    if (!searchQuery.trim()) return visibleErrors;
    const q = searchQuery.toLowerCase();
    return visibleErrors.filter(
      (e) =>
        e.message.toLowerCase().includes(q) ||
        (e.route && e.route.toLowerCase().includes(q)) ||
        (e.cause && e.cause.toLowerCase().includes(q))
    );
  }, [visibleErrors, searchQuery]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.repoUrl.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  useEffect(() => {
    document.title = selectedProject
      ? `${selectedProject.name} — StackPilot`
      : "Dashboard — StackPilot";
  }, [selectedProject]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ready && !signedIn) window.location.replace("/");
  }, [ready, signedIn]);

  useEffect(() => {
    if (!ready || !signedIn) return;
    let cancelled = false;

    const loadProjects = async () => {
      setProjectState("loading");
      setNotice("");
      try {
        const result = await fetchProjects(page);
        if (cancelled) return;
        setProjects(result.projects);
        setTotalPages(result.totalPages);
        setSelectedProjectId((current) => {
          if (current && result.projects.some((p) => p._id === current)) return current;
          return result.projects[0]?._id ?? null;
        });
        setProjectState("ready");
      } catch (error) {
        if (!cancelled) {
          setProjectState("error");
          setNotice(error instanceof Error ? error.message : "Failed to load projects");
        }
      }
    };

    loadProjects();
    return () => { cancelled = true; };
  }, [ready, signedIn, page]);

  const loadErrors = useCallback(async (projectId: string, quiet = false) => {
    if (!quiet) setErrorState("loading");
    try {
      const result = await fetchErrorGroups(projectId);
      setErrors(result.errors);
      setErrorState("ready");
    } catch (error) {
      setErrors([]);
      setErrorState("error");
      setNotice(error instanceof Error ? error.message : "Failed to load errors");
    }
  }, []);

  useEffect(() => {
    const projectId = selectedProjectId;
    if (!projectId) return;
    let cancelled = false;

    const loadSelectedErrors = async () => {
      setErrorState("loading");
      try {
        const result = await fetchErrorGroups(projectId);
        if (!cancelled) {
          setErrors(result.errors);
          setErrorState("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setErrors([]);
          setErrorState("error");
          setNotice(error instanceof Error ? error.message : "Failed to load errors");
        }
      }
    };

    loadSelectedErrors();
    return () => { cancelled = true; };
  }, [selectedProjectId]);

  useEffect(() => {
    const projectId = selectedProjectId;
    if (!projectId) return;
    const interval = window.setInterval(() => loadErrors(projectId, true), 15_000);
    return () => window.clearInterval(interval);
  }, [loadErrors, selectedProjectId]);

  useEffect(() => {
    if (!copyNotice) return;
    const timeout = window.setTimeout(() => setCopyNotice(""), 2_000);
    return () => window.clearTimeout(timeout);
  }, [copyNotice]);

  const totalEvents = filteredErrors.reduce((sum, e) => sum + e.count, 0);
  const activeRoutes = new Set(
    filteredErrors.flatMap((e) => e.affectedRoutes?.length ? e.affectedRoutes : [e.route ?? ""])
  );
  activeRoutes.delete("");

  const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const project = await createProject({ name: form.name, repoUrl: form.repoUrl });
      setProjects((current) => [project, ...current]);
      setSelectedProjectId(project._id);
      setForm({ name: "", repoUrl: "" });
      setNotice("Project created. Use the setup snippet to start sending logs.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingId(projectId);
    setNotice("");
    try {
      await deleteProject(projectId);
      setProjects((current) => {
        const remaining = current.filter((p) => p._id !== projectId);
        setSelectedProjectId(remaining[0]?._id ?? null);
        return remaining;
      });
      setNotice("Project deleted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

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

  const copyText = async (text: string, label: string) => {
    try {
      await window.navigator.clipboard.writeText(text);
      setCopyNotice(`${label} copied.`);
    } catch {
      setCopyNotice("Copy failed. Select the text manually.");
    }
  };

  if (!ready || !signedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-6">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-[#667085]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
          </svg>
          <p className="text-sm font-medium text-[#667085]">Checking session...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9] text-[#15171a]">
      <Header showSignOut />

      <main className="flex-1">
        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[340px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4 animate-fade-in">
            {/* New project form */}
            <form onSubmit={handleCreateProject} className="rounded-lg border border-[#d9dee7] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">New project</p>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-sm font-medium">Name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                    required
                    maxLength={80}
                    className="mt-1 h-10 w-full rounded-md border border-[#d8dde5] px-3 text-sm outline-none transition focus:border-[#15171a] focus:ring-1 focus:ring-[#15171a]"
                    placeholder="Checkout service"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Repository URL</span>
                  <input
                    value={form.repoUrl}
                    onChange={(e) => setForm((c) => ({ ...c, repoUrl: e.target.value }))}
                    required
                    type="url"
                    className="mt-1 h-10 w-full rounded-md border border-[#d8dde5] px-3 text-sm outline-none transition focus:border-[#15171a] focus:ring-1 focus:ring-[#15171a]"
                    placeholder="https://github.com/org/repo"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-4 h-10 w-full rounded-md bg-[#15171a] px-4 text-sm font-semibold text-white transition hover:bg-[#2b2f35] disabled:cursor-not-allowed disabled:bg-[#9aa3af]"
              >
                {saving ? "Creating..." : "Create project"}
              </button>
            </form>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects & errors..."
                className="h-10 w-full rounded-md border border-[#d8dde5] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#15171a] focus:ring-1 focus:ring-[#15171a]"
              />
            </div>

            {/* Project list */}
            <div className="rounded-lg border border-[#d9dee7] bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between px-2 py-2">
                <p className="text-sm font-semibold">Projects</p>
                <span className="text-xs font-medium text-[#667085]">{filteredProjects.length}</span>
              </div>
              <div className="space-y-1">
                {projectState === "loading" ? (
                  <div className="space-y-2 py-2">
                    <SkeletonProjectItem />
                    <SkeletonProjectItem />
                    <SkeletonProjectItem />
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <p className="px-2 py-6 text-sm leading-6 text-[#667085]">
                    {searchQuery ? "No projects match your search." : "Create a project to receive a project key and start ingesting logs."}
                  </p>
                ) : (
                  filteredProjects.map((project) => (
                    <button
                      key={project._id}
                      type="button"
                      onClick={() => setSelectedProjectId(project._id)}
                      className={`w-full rounded-md border px-3 py-3 text-left transition ${
                        selectedProjectId === project._id
                          ? "border-[#15171a] bg-[#f7f8fa]"
                          : "border-transparent hover:border-[#d8dde5] hover:bg-[#fbfcfd]"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{project.name}</span>
                      <span className="mt-1 block truncate text-xs text-[#667085]">{project.repoUrl}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between border-t border-[#edf0f4] px-2 pt-3">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-md border border-[#d8dde5] px-2.5 py-1.5 text-xs font-semibold transition hover:bg-[#f7f8fa] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-medium text-[#667085]">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-md border border-[#d8dde5] px-2.5 py-1.5 text-xs font-semibold transition hover:bg-[#f7f8fa] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <section className="space-y-6 animate-slide-up">
            {notice && (
              <div className="rounded-lg border border-[#d9dee7] bg-white px-4 py-3 text-sm text-[#475467] animate-fade-in">
                {notice}
              </div>
            )}
            {copyNotice && (
              <div className="rounded-lg border border-[#bbd7c6] bg-[#f0fdf4] px-4 py-3 text-sm font-medium text-[#027a48] animate-fade-in">
                {copyNotice}
              </div>
            )}

            {/* Dashboard header */}
            <div className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">Dashboard</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                    {selectedProject ? selectedProject.name : "Set up your first project"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6b7a]">
                    {selectedProject
                      ? selectedProject.repoUrl
                      : "Create a project, install the logger, then watch grouped runtime failures appear here."}
                  </p>
                </div>
                {selectedProject && (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/projects/${selectedProject._id}`}
                      className="inline-flex h-10 items-center rounded-md border border-[#d8dde5] px-3 text-sm font-semibold text-[#303741] transition hover:bg-[#f7f8fa]"
                    >
                      Details
                    </Link>
                    <button type="button" onClick={() => loadErrors(selectedProject._id)} className="h-10 rounded-md border border-[#d8dde5] px-3 text-sm font-semibold text-[#303741] transition hover:bg-[#f7f8fa]">
                      Refresh
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === selectedProject._id}
                      onClick={() => handleDeleteProject(selectedProject._id)}
                      className="h-10 rounded-md border border-[#f0b4b4] px-3 text-sm font-semibold text-[#b42318] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === selectedProject._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Error groups" value={String(filteredErrors.length)} />
                <MetricCard label="Total events" value={String(totalEvents)} />
                <MetricCard label="Affected routes" value={String(activeRoutes.size)} />
              </div>
            </div>

            {/* SDK setup */}
            {selectedProject && (
              <div className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm animate-fade-in">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">Install</p>
                    <h2 className="mt-2 text-xl font-semibold">SDK setup</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f6b7a]">
                      Initialize the logger once in your client entry point. The backend groups repeated failures and runs AI analysis in the background.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(selectedProject.projectKey, "Project key")}
                    className="rounded-md border border-[#d8dde5] bg-[#f7f8fa] px-3 py-2 text-left font-mono text-xs text-[#303741] transition hover:border-[#b8c0cc]"
                  >
                    {selectedProject.projectKey}
                  </button>
                </div>
                <div className="mt-4 overflow-hidden rounded-md bg-[#111316]">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                    <span className="text-xs font-semibold text-white/70">client setup</span>
                    <button
                      type="button"
                      onClick={() => copyText(getSdkSnippet(selectedProject), "SDK snippet")}
                      className="rounded-md border border-white/15 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-6 text-white">
                    <code>{getSdkSnippet(selectedProject)}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Grouped errors */}
            <div className="rounded-lg border border-[#d9dee7] bg-white shadow-sm">
              <div className="border-b border-[#edf0f4] px-6 py-4">
                <h2 className="text-xl font-semibold">Grouped errors</h2>
              </div>
              {renderErrors(visibleErrorState, filteredErrors, analyzingId, handleAnalyzeError)}
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function getSdkSnippet(project: Project) {
  return `import { initLogger } from "@stackpilot/sdk";

initLogger({
  projectKey: "${project.projectKey}",
  endpoint: "${API_BASE_URL}/logs"
});`;
}

function renderErrors(
  state: LoadState,
  errors: ErrorGroup[],
  analyzingId: string | null,
  onAnalyze: (error: ErrorGroup) => void,
) {
  if (state === "loading") {
    return (
      <div className="divide-y divide-[#edf0f4]">
        <SkeletonErrorRow />
        <SkeletonErrorRow />
        <SkeletonErrorRow />
      </div>
    );
  }

  if (state === "error") {
    return (
      <p className="px-6 py-10 text-sm text-[#b42318]">
        Failed to load grouped errors.
      </p>
    );
  }

  if (errors.length === 0) {
    return (
      <p className="px-6 py-10 text-sm leading-6 text-[#667085]">
        No errors captured yet. Send a log with the SDK snippet above and this panel will update after refresh.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[#edf0f4]">
      {errors.map((error) => (
        <article key={error._id} className="px-6 py-5 transition-colors hover:bg-[#fbfcfd]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
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
              <h3 className="mt-3 break-words text-base font-semibold">{error.message}</h3>
              <p className="mt-2 text-sm text-[#667085]">
                {error.route || "Route not provided"} - {error.count} event{error.count === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {error.aiAnalyzed !== "done" && (
                <button
                  type="button"
                  disabled={analyzingId === error._id}
                  onClick={() => onAnalyze(error)}
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
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 2a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.4V11h4V9.4A4 4 0 0 0 12 2Z" />
                        <path d="M10 11v2a2 2 0 1 0 4 0v-2" />
                        <path d="M8 15h8" />
                        <path d="M9 18h6" />
                      </svg>
                      Analyze
                    </>
                  )}
                </button>
              )}
              <p className="text-sm text-[#667085] whitespace-nowrap">
                {new Date(error.lastSeenAt).toLocaleString()}
              </p>
            </div>
          </div>
          {error.cause && (
            <p className="mt-4 text-sm leading-6 text-[#303741]">{error.cause}</p>
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
  );
}

function severityClassName(severity: ErrorGroup["severity"]) {
  const base = "rounded-md px-2 py-1 text-xs font-semibold";
  if (severity === "high") return `${base} bg-[#fdecec] text-[#b42318]`;
  if (severity === "medium") return `${base} bg-[#fff7e6] text-[#a15c07]`;
  return `${base} bg-[#ecfdf3] text-[#027a48]`;
}
