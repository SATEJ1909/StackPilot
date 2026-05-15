"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";

import {
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
import { Copy, FolderCode, Terminal, AlertTriangle, ArrowRight, Activity, Cpu } from "lucide-react";

export default function ProjectDetailPage() {
  const token = useAuthToken();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [notice, setNotice] = useState("");

  const { data: project, error: projectError } = useSWR(
    token && projectId ? ["project", projectId] : null,
    ([_, id]) => fetchProject(id)
  );

  const { data: errorResult, error: errorsError } = useSWR(
    token && projectId ? ["errorGroups", projectId] : null,
    ([_, id]) => fetchErrorGroups(id),
    { refreshInterval: 15000 }
  );

  const errors = errorResult?.errors || [];
  const isLoading = !project || (!errorResult && !errorsError);
  const hasError = projectError || errorsError;

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
    }
  }, [token]);

  const copyText = async (value: string, label: string) => {
    try {
      await window.navigator.clipboard.writeText(value);
      setNotice(`${label} copied.`);
      setTimeout(() => setNotice(""), 3000);
    } catch {
      setNotice("Copy failed. Select the text manually.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--sp-bg)] text-[var(--sp-text)]">
      <Header showDashboard />

      <main className="flex-1 relative">
        <section className="mx-auto max-w-6xl space-y-6 px-6 py-8">
          {notice && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[var(--sp-border-subtle)] bg-white px-4 py-3 text-sm font-medium text-[var(--sp-text-secondary)] shadow-sm flex items-center justify-between"
            >
              {notice}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isLoading && !hasError && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, position: "absolute", width: "100%" }}
                className="space-y-6 w-full"
              >
                <SkeletonCard />
                <SkeletonCard />
              </motion.div>
            )}

            {hasError && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-3xl rounded-2xl border border-[var(--sp-border)] glass-card p-6"
              >
                <div className="flex items-center gap-3 text-[var(--sp-danger)] mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="text-sm font-semibold">Project could not be loaded.</p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--sp-border-input)] bg-white px-4 text-sm font-semibold text-[var(--sp-text-label)] transition-all hover:bg-gray-50 active:scale-95"
                >
                  Back to dashboard
                </Link>
              </motion.div>
            )}

            {!isLoading && !hasError && project && (
              <motion.div 
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {/* Project info */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--sp-border)] glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-[var(--sp-text)]">
                      <FolderCode className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sp-text-muted)]">Project</p>
                      <h1 className="text-3xl font-bold tracking-tight text-[var(--sp-text)]">{project.name}</h1>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-[var(--sp-border-subtle)] pt-4">
                    <a
                      href={project.repoUrl}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--sp-info)] transition-colors hover:text-blue-700 hover:underline"
                      rel="noreferrer"
                      target="_blank"
                    >
                      {project.repoUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyText(project.projectKey, "Project key")}
                      className="group flex items-center gap-2 rounded-xl border border-[var(--sp-border-input)] bg-white px-3 py-2 text-left font-mono text-xs text-[var(--sp-text-label)] transition-all hover:border-[var(--sp-border)] hover:bg-gray-50 active:scale-[0.98]"
                    >
                      <span className="text-gray-400">Key:</span> {project.projectKey}
                      <Copy className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                    </button>
                  </div>
                </motion.div>

                {/* SDK setup */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--sp-border)] glass-card p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sp-info-bg)] text-[var(--sp-info)]">
                        <Terminal className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sp-text-muted)]">Install</p>
                        <h2 className="text-xl font-bold">SDK setup</h2>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(snippet, "SDK snippet")}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--sp-border-input)] bg-white px-4 text-sm font-semibold transition-all hover:bg-gray-50 active:scale-95"
                    >
                      <Copy className="h-4 w-4 text-gray-500" /> Copy
                    </button>
                  </div>
                  <pre className="mt-5 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm leading-relaxed text-gray-100 shadow-inner">
                    <code>{snippet}</code>
                  </pre>
                </motion.div>

                {/* Errors */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--sp-border)] glass-card overflow-hidden">
                  <div className="border-b border-[var(--sp-border-subtle)] px-6 py-5 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <h2 className="text-lg font-bold">Latest grouped errors</h2>
                    </div>
                  </div>
                  {errors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                        <Activity className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-medium text-[var(--sp-text-muted)]">
                        No grouped errors yet.
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Once the SDK sends logs, new groups appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--sp-border-subtle)] bg-white">
                      {errors.map((error) => (
                        <article key={error._id} className="px-6 py-5 transition-colors hover:bg-gray-50/50 group">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
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
                              <p className="text-base font-bold text-[var(--sp-text)]">{error.message}</p>
                              <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--sp-text-secondary)]">
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{error.route || "N/A"}</span>
                                &mdash;
                                <span>{error.count} event{error.count === 1 ? "" : "s"}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 lg:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/dashboard/projects/${projectId}/errors/${error._id}`}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--sp-accent)] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--sp-accent-hover)] hover:scale-[1.02] active:scale-[0.98]"
                              >
                                View Analysis <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function severityClassName(severity: ErrorGroup["severity"]) {
  const base = "rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider";
  if (severity === "high") return `${base} bg-[var(--sp-danger-bg)] text-[var(--sp-danger)]`;
  if (severity === "medium") return `${base} bg-[var(--sp-warning-bg)] text-[var(--sp-warning)]`;
  return `${base} bg-[var(--sp-success-bg)] text-[var(--sp-success)]`;
}
