"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";

import {
  analyzeError,
  ErrorGroup,
  fetchErrorGroup,
  fetchLogs,
  fetchProject,
  LogEntry,
  Project,
} from "@/lib/api";
import { useAuthToken } from "@/lib/auth";
import { Header } from "@/app/components/header";
import { Footer } from "@/app/components/footer";
import { SkeletonCard } from "@/app/components/skeleton";
import { ArrowLeft, RefreshCw, Cpu, Activity, AlertTriangle } from "lucide-react";

export default function ErrorAnalysisPage() {
  const token = useAuthToken();
  const params = useParams<{ id: string; errorId: string }>();
  const projectId = params.id;
  const errorId = params.errorId;

  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const { data: project, error: projectError } = useSWR(
    token && projectId ? ["project", projectId] : null,
    ([_, id]) => fetchProject(id)
  );

  const { data: errorGroup, error: groupError, mutate: mutateGroup } = useSWR(
    token && projectId && errorId ? ["errorGroup", projectId, errorId] : null,
    ([_, pid, eid]) => fetchErrorGroup(pid, eid)
  );

  const { data: logsData } = useSWR(
    token && projectId && errorId ? ["logs", projectId, errorId] : null,
    ([_, pid, eid]) => fetchLogs(pid, eid)
  );

  const logs = logsData?.logs || [];
  const isLoading = !project || !errorGroup;
  const hasError = projectError || groupError;

  useEffect(() => {
    if (project && errorGroup) {
      document.title = `Analysis: ${errorGroup.message} — StackPilot`;
    }
  }, [project, errorGroup]);

  useEffect(() => {
    if (!token) {
      window.location.replace("/");
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

    socket.on("connect", () => {
      socket.emit("join_project", projectId);
    });

    socket.on("analysis_updated", (data: any) => {
      if (data.errorGroupId === errorId) {
        mutateGroup((current) => current ? {
          ...current,
          type: data.aiData.type,
          reasoning: data.aiData.reasoning,
          cause: data.aiData.cause,
          fix: data.aiData.fix,
          severity: data.aiData.severity,
          aiAnalyzed: "done"
        } : undefined, false);
        setNotice("AI analysis completed via real-time update.");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, errorId, token, mutateGroup]);

  const handleAnalyzeError = async () => {
    if (!errorGroup) return;
    setAnalyzingId(errorGroup._id);
    setNotice("AI is analyzing the error...");
    try {
      const result = await analyzeError({
        errorGroupId: errorGroup._id,
        message: errorGroup.message,
        route: errorGroup.route,
      });
      mutateGroup((current) => current ? { ...current, ...result, aiAnalyzed: "done" } : undefined, false);
      setNotice("AI analysis complete.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setAnalyzingId(null);
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
                  <p className="text-sm font-semibold">Error details could not be loaded.</p>
                </div>
                <Link
                  href={`/dashboard/projects/${projectId}`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--sp-border-input)] bg-white px-4 text-sm font-semibold text-[var(--sp-text-label)] transition-all hover:bg-gray-50 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to project
                </Link>
              </motion.div>
            )}

            {!isLoading && !hasError && project && errorGroup && (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {/* Breadcrumb */}
                <motion.div variants={itemVariants} className="flex items-center gap-2 text-sm text-[var(--sp-text-muted)]">
                  <Link href={`/dashboard/projects/${projectId}`} className="hover:text-[var(--sp-info)] transition-colors">
                    {project.name}
                  </Link>
                  <span>/</span>
                  <span className="font-semibold text-[var(--sp-text)]">Error Analysis</span>
                </motion.div>

                {notice && (
                  <motion.div variants={itemVariants} className="rounded-xl border border-[var(--sp-border-subtle)] bg-white px-4 py-3 text-sm text-[var(--sp-text-secondary)] shadow-sm">
                    {notice}
                  </motion.div>
                )}

                {/* Error Header */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--sp-border)] glass-card p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={severityClassName(errorGroup.severity)}>
                      {errorGroup.severity}
                    </span>
                    <span className="rounded-md bg-[var(--sp-info-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--sp-info)] flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {errorGroup.aiAnalyzed}
                    </span>
                    {errorGroup.type && (
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {errorGroup.type}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--sp-text)]">{errorGroup.message}</h1>
                  <p className="mt-3 flex items-center gap-2 text-sm text-[var(--sp-text-muted)]">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{errorGroup.route || "N/A"}</span>
                    &mdash;
                    <span>Seen {errorGroup.count} time{errorGroup.count === 1 ? "" : "s"}</span>
                  </p>
                </motion.div>

                {/* AI Analysis Section */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--sp-border)] glass-card overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sp-info-bg)] text-[var(--sp-info)]">
                          <Cpu className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sp-text-muted)]">Insights</p>
                          <h2 className="text-xl font-bold">AI Analysis</h2>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={analyzingId === errorGroup._id}
                        onClick={handleAnalyzeError}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--sp-accent)] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--sp-accent-hover)] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {analyzingId === errorGroup._id ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
                          </>
                        ) : (
                          errorGroup.aiAnalyzed === "done" ? "Re-analyze Error" : "Analyze Error"
                        )}
                      </button>
                    </div>

                    {errorGroup.aiAnalyzed === "done" ? (
                      <div className="space-y-6 mt-6 border-t border-[var(--sp-border-subtle)] pt-6">
                        {errorGroup.reasoning && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <h3 className="text-sm font-semibold text-[var(--sp-text-label)]">Reasoning</h3>
                            <div className="md:col-span-3 text-sm leading-relaxed text-[var(--sp-text-secondary)]">
                              {errorGroup.reasoning}
                            </div>
                          </div>
                        )}
                        {errorGroup.cause && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-dashed border-gray-100">
                            <h3 className="text-sm font-semibold text-[var(--sp-danger)]">Root Cause</h3>
                            <div className="md:col-span-3">
                              <div className="rounded-xl border border-[var(--sp-danger-bg)] bg-[var(--sp-danger-bg)] p-4 text-sm leading-relaxed text-[var(--sp-danger)] shadow-sm">
                                {errorGroup.cause}
                              </div>
                            </div>
                          </div>
                        )}
                        {errorGroup.fix && errorGroup.fix.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-dashed border-gray-100">
                            <h3 className="text-sm font-semibold text-[var(--sp-success)]">Proposed Fixes</h3>
                            <div className="md:col-span-3">
                              <ul className="space-y-3">
                                {errorGroup.fix.map((f, i) => (
                                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-[var(--sp-text-secondary)]">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sp-success-bg)] text-[10px] font-bold text-[var(--sp-success)]">
                                      {i + 1}
                                    </span>
                                    <span className="pt-0.5">{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                          <Cpu className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-[var(--sp-text-muted)]">
                          {errorGroup.aiAnalyzed === "processing"
                            ? "AI analysis is in progress... Please wait."
                            : "Click analyze above to generate AI insights."}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Logs */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-[var(--sp-border)] glass-card overflow-hidden">
                  <div className="border-b border-[var(--sp-border-subtle)] px-6 py-5 bg-gray-50/50">
                    <h2 className="text-lg font-bold">Raw Logs</h2>
                  </div>
                  {logs.length === 0 ? (
                    <p className="px-6 py-12 text-center text-sm text-[var(--sp-text-muted)]">
                      No raw logs found for this error group.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-[var(--sp-text-secondary)]">
                        <thead className="bg-white text-xs uppercase tracking-wider text-[var(--sp-text-muted)] border-b border-[var(--sp-border-subtle)]">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Timestamp</th>
                            <th className="px-6 py-4 font-semibold">Route</th>
                            <th className="px-6 py-4 font-semibold">Stack / Message</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--sp-border-subtle)] bg-white">
                          {logs.map((log) => (
                            <tr key={log._id} className="transition-colors hover:bg-gray-50/50">
                              <td className="whitespace-nowrap px-6 py-4 text-xs font-medium">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-block rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                  {log.route || "/"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-[var(--sp-text)] mb-1.5">{log.message}</p>
                                {log.stack && (
                                  <pre className="max-w-xl overflow-x-auto rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 font-mono">
                                    {log.stack.split("\n")[0]}...
                                  </pre>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
