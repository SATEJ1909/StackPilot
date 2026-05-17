"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";

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
import { useAuthToken } from "@/lib/auth";
import { Header } from "@/app/components/header";
import { Footer } from "@/app/components/footer";
import { MetricCard } from "@/app/components/metric-card";
import { SkeletonErrorRow, SkeletonProjectItem } from "@/app/components/skeleton";
import { Plus, Search, Trash2, RefreshCw, Folder, Cpu, Copy, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const token = useAuthToken();
  const signedIn = Boolean(token);
  const [ready, setReady] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [notice, setNotice] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [form, setForm] = useState({ name: "", repoUrl: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ready && !signedIn) window.location.replace("/");
  }, [ready, signedIn]);

  // --- SWR Data Fetching ---
  const { data: projectData, error: projectError, mutate: mutateProjects } = useSWR(
    ready && signedIn ? ["projects", page] : null,
    ([_, p]) => fetchProjects(p)
  );

  const projects = useMemo(() => projectData?.projects || [], [projectData]);
  const totalPages = projectData?.totalPages || 1;
  const projectState = !projectData && !projectError ? "loading" : projectError ? "error" : "ready";
  const activeProjectId = selectedProjectId ?? projects[0]?._id ?? null;

  const { data: errorData, error: errorsError, mutate: mutateErrors } = useSWR(
    activeProjectId ? ["errorGroups", activeProjectId] : null,
    ([_, id]) => fetchErrorGroups(id),
    { refreshInterval: 15000 }
  );

  const visibleErrors = useMemo(() => errorData?.errors || [], [errorData]);
  const visibleErrorState = !errorData && !errorsError ? "loading" : errorsError ? "error" : "ready";

  const selectedProject = useMemo(() => {
    return projects.find((project) => project._id === activeProjectId) ?? null;
  }, [projects, activeProjectId]);

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
      await mutateProjects();
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
      await mutateProjects();
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
      await analyzeError({
        errorGroupId: errorGroup._id,
        message: errorGroup.message,
        route: errorGroup.route,
      });
      await mutateErrors();
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
    <div className="flex min-h-screen flex-col bg-[var(--sp-bg)] text-[var(--sp-text)]">
      <Header showSignOut />

      <main className="flex-1">
        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[340px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {/* New project form */}
            <form onSubmit={handleCreateProject} className="rounded-2xl border border-[var(--sp-border)] glass-card p-5 mb-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--sp-text-muted)]">
                <Plus className="h-4 w-4" /> New project
              </p>
              <div className="mt-4 space-y-4">
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
                className="mt-5 h-10 w-full rounded-xl bg-[var(--sp-accent)] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--sp-accent-hover)] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create project"}
              </button>
            </form>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects & errors..."
                className="h-10 w-full rounded-xl border border-[var(--sp-border-input)] bg-white/50 backdrop-blur pl-10 pr-3 text-sm outline-none transition-all focus:border-[var(--sp-info)] focus:ring-2 focus:ring-[var(--sp-info-bg)]"
              />
            </div>

            {/* Project list */}
            <div className="rounded-2xl border border-[var(--sp-border)] glass-card p-2">
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
                        activeProjectId === project._id
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
            </motion.div>
          </aside>

          {/* Main content */}
          <section className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProjectId || "empty"}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                className="space-y-6"
              >
            {notice && (
              <div className="rounded-xl border border-[var(--sp-border-subtle)] bg-white px-4 py-3 text-sm text-[var(--sp-text-secondary)] shadow-sm">
                {notice}
              </div>
            )}
            {copyNotice && (
              <div className="rounded-xl border border-[var(--sp-success-bg)] bg-[var(--sp-success-bg)] px-4 py-3 text-sm font-medium text-[var(--sp-success)]">
                {copyNotice}
              </div>
            )}

            {/* Dashboard header */}
            <div className="rounded-2xl border border-[var(--sp-border)] glass-card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sp-text-muted)]">Dashboard</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--sp-text)]">
                    {selectedProject ? selectedProject.name : "Set up your first project"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sp-text-secondary)]">
                    {selectedProject
                      ? selectedProject.repoUrl
                      : "Create a project, install the logger, then watch grouped runtime failures appear here."}
                  </p>
                </div>
                {selectedProject && (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/projects/${selectedProject._id}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--sp-border-input)] bg-white px-4 text-sm font-semibold text-[var(--sp-text-label)] transition-all hover:bg-gray-50 hover:border-[var(--sp-border)] active:scale-[0.98]"
                    >
                      <Folder className="h-4 w-4" /> Details
                    </Link>
                    <button type="button" onClick={() => mutateErrors()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--sp-border-input)] bg-white px-4 text-sm font-semibold text-[var(--sp-text-label)] transition-all hover:bg-gray-50 active:scale-[0.98]">
                      <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === selectedProject._id}
                      onClick={() => handleDeleteProject(selectedProject._id)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--sp-danger-bg)] bg-white px-4 text-sm font-semibold text-[var(--sp-danger)] transition-all hover:bg-[var(--sp-danger-bg)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === selectedProject._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Error groups" value={String(filteredErrors.length)} />
                <MetricCard label="Total events" value={String(totalEvents)} />
                <MetricCard label="Affected routes" value={String(activeRoutes.size)} />
              </div>
            </div>

            {/* SDK setup */}
            {selectedProject && (
              <div className="rounded-2xl border border-[var(--sp-border)] glass-card p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sp-text-muted)]">Install</p>
                    <h2 className="mt-2 text-xl font-bold">SDK setup</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--sp-text-secondary)]">
                      Initialize the logger once in your client entry point. The backend groups repeated failures and runs AI analysis in the background.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(selectedProject.projectKey, "Project key")}
                    className="group flex items-center gap-2 rounded-xl border border-[var(--sp-border-input)] bg-white px-3 py-2 text-left font-mono text-xs text-[var(--sp-text-label)] transition-all hover:border-[var(--sp-border)] hover:bg-gray-50 active:scale-[0.98]"
                  >
                    <span className="text-gray-400">Key:</span> {selectedProject.projectKey}
                    <Copy className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </div>
                <div className="mt-5 overflow-hidden rounded-xl bg-gray-900 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 bg-gray-800">
                    <span className="text-xs font-semibold text-gray-300">client setup</span>
                    <button
                      type="button"
                      onClick={() => copyText(getSdkSnippet(selectedProject), "SDK snippet")}
                      className="rounded-md border border-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-95"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-gray-100">
                    <code>{getSdkSnippet(selectedProject)}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Grouped errors */}
            <div className="rounded-2xl border border-[var(--sp-border)] glass-card overflow-hidden">
              <div className="border-b border-[var(--sp-border-subtle)] px-6 py-5 bg-gray-50/50">
                <h2 className="text-lg font-bold">Grouped errors</h2>
              </div>
              {renderErrors(visibleErrorState, filteredErrors, analyzingId, handleAnalyzeError)}
            </div>
              </motion.div>
            </AnimatePresence>
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
  state: "loading" | "ready" | "error" | "idle",
  errors: ErrorGroup[],
  analyzingId: string | null,
  onAnalyze: (error: ErrorGroup) => void,
) {
  if (state === "loading" || state === "idle") {
    return (
      <div className="divide-y divide-[var(--sp-border-subtle)]">
        <SkeletonErrorRow />
        <SkeletonErrorRow />
        <SkeletonErrorRow />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-8 w-8 text-[var(--sp-danger)] mb-3" />
        <p className="text-sm font-medium text-[var(--sp-danger)]">Failed to load grouped errors.</p>
      </div>
    );
  }

  if (errors.length === 0) {
    return (
      <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
          <Cpu className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-[var(--sp-text-muted)] max-w-sm">
          No errors captured yet. Send a log with the SDK snippet above and this panel will automatically update.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--sp-border-subtle)] bg-white">
      {errors.map((error) => (
        <article key={error._id} className="px-6 py-5 transition-colors hover:bg-gray-50/50">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={severityClassName(error.severity)}>
                  {error.severity}
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-[var(--sp-info-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--sp-info)]">
                  <Cpu className="h-3 w-3" />
                  {error.aiAnalyzed}
                </span>
                {error.type && (
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {error.type}
                  </span>
                )}
              </div>
              <h3 className="break-words text-base font-bold text-[var(--sp-text)]">{error.message}</h3>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--sp-text-secondary)]">
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{error.route || "N/A"}</span>
                &mdash;
                <span>{error.count} event{error.count === 1 ? "" : "s"}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <p className="text-xs font-medium text-gray-400">
                {new Date(error.lastSeenAt).toLocaleString()}
              </p>
              {error.aiAnalyzed !== "done" && (
                <button
                  type="button"
                  disabled={analyzingId === error._id}
                  onClick={() => onAnalyze(error)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--sp-border-input)] bg-white px-4 text-xs font-bold text-[var(--sp-text-label)] shadow-sm transition-all hover:bg-gray-50 hover:border-[var(--sp-border)] active:scale-95 disabled:opacity-50"
                >
                  {analyzingId === error._id ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Cpu className="h-3.5 w-3.5" /> Analyze
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          {error.cause && (
            <div className="mt-4 rounded-xl bg-[var(--sp-danger-bg)] p-3 border border-red-100">
              <p className="text-sm font-medium text-[var(--sp-danger)]">{error.cause}</p>
            </div>
          )}
          {error.fix?.length ? (
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--sp-success)]">
              {error.fix.map((fix) => (
                <li key={fix}>
                  <span className="text-[var(--sp-text-secondary)]">{fix}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function severityClassName(severity: ErrorGroup["severity"]) {
  const base = "rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider";
  if (severity === "high") return `${base} bg-[var(--sp-danger-bg)] text-[var(--sp-danger)]`;
  if (severity === "medium") return `${base} bg-[var(--sp-warning-bg)] text-[var(--sp-warning)]`;
  return `${base} bg-[var(--sp-success-bg)] text-[var(--sp-success)]`;
}
