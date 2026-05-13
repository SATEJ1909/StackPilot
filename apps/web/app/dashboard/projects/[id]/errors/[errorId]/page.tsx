"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

type LoadState = "loading" | "ready" | "error";

export default function ErrorAnalysisPage() {
  const token = useAuthToken();
  const params = useParams<{ id: string; errorId: string }>();
  const projectId = params.id;
  const errorId = params.errorId;

  const [project, setProject] = useState<Project | null>(null);
  const [errorGroup, setErrorGroup] = useState<ErrorGroup | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [notice, setNotice] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

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
    let cancelled = false;

    const loadData = async () => {
      setState("loading");
      try {
        const [projectResult, errorGroupResult, logsResult] = await Promise.all([
          fetchProject(projectId),
          fetchErrorGroup(projectId, errorId),
          fetchLogs(projectId, errorId),
        ]);
        if (!cancelled) {
          setProject(projectResult);
          setErrorGroup(errorGroupResult);
          setLogs(logsResult.logs);
          setState("ready");
        }
      } catch (error) {
        if (!cancelled) {
          setState("error");
          setNotice(error instanceof Error ? error.message : "Failed to load error details");
        }
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [projectId, errorId, token]);

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
      setErrorGroup((current) => current ? { ...current, ...result, aiAnalyzed: "done" } : null);
      setNotice("AI analysis complete.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setAnalyzingId(null);
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

  if (state === "error" || !project || !errorGroup) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f6f7f9]">
        <Header showDashboard />
        <main className="flex-1 px-6 py-10">
          <section className="mx-auto max-w-3xl rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm animate-fade-in">
            <p className="text-sm font-semibold text-[#b42318]">
              {notice || "Error details could not be loaded."}
            </p>
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="mt-5 inline-flex h-10 items-center rounded-md border border-[#d8dde5] px-3 text-sm font-semibold"
            >
              Back to project
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
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#475467] animate-fade-in">
            <Link href={`/dashboard/projects/${projectId}`} className="hover:text-[#175cd3] hover:underline">
              {project.name}
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#15171a]">Error Analysis</span>
          </div>

          {notice && (
            <div className="rounded-lg border border-[#d9dee7] bg-white px-4 py-3 text-sm text-[#475467] animate-fade-in">
              {notice}
            </div>
          )}

          {/* Error Header */}
          <div className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm animate-slide-up">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={severityClassName(errorGroup.severity)}>
                {errorGroup.severity}
              </span>
              <span className="rounded-md bg-[#eef4ff] px-2 py-1 text-xs font-semibold text-[#175cd3]">
                {errorGroup.aiAnalyzed}
              </span>
              {errorGroup.type && (
                <span className="rounded-md bg-[#f2f4f7] px-2 py-1 text-xs font-semibold text-[#475467]">
                  {errorGroup.type}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{errorGroup.message}</h1>
            <p className="mt-2 text-sm text-[#667085]">
              Route: {errorGroup.route || "N/A"} &mdash; Seen {errorGroup.count} time{errorGroup.count === 1 ? "" : "s"}
            </p>
          </div>

          {/* AI Analysis Section */}
          <div className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">Insights</p>
                <h2 className="mt-2 text-xl font-semibold">AI Analysis</h2>
              </div>
              <button
                type="button"
                disabled={analyzingId === errorGroup._id}
                onClick={handleAnalyzeError}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#175cd3] px-4 text-sm font-semibold text-white transition hover:bg-[#1553bd] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analyzingId === errorGroup._id ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  errorGroup.aiAnalyzed === "done" ? "Re-analyze with AI" : "Analyze with AI"
                )}
              </button>
            </div>

            {errorGroup.aiAnalyzed === "done" ? (
              <div className="space-y-6 mt-6">
                {errorGroup.reasoning && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#303741]">Reasoning</h3>
                    <p className="mt-2 text-sm leading-6 text-[#475467] p-4 bg-[#fbfcfd] border border-[#edf0f4] rounded-md">{errorGroup.reasoning}</p>
                  </div>
                )}
                {errorGroup.cause && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#303741]">Root Cause</h3>
                    <p className="mt-2 text-sm leading-6 text-[#b42318] p-4 bg-[#fef3f2] border border-[#fee4e2] rounded-md">{errorGroup.cause}</p>
                  </div>
                )}
                {errorGroup.fix && errorGroup.fix.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#303741]">Proposed Fixes</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[#027a48] p-4 bg-[#f6fef9] border border-[#d1fadf] rounded-md">
                      {errorGroup.fix.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#667085] mt-4">
                {errorGroup.aiAnalyzed === "processing" ? "AI analysis is currently in progress. Refresh the page or wait." : "Click the button above to trigger an AI analysis."}
              </p>
            )}
          </div>

          {/* Logs */}
          <div className="rounded-lg border border-[#d9dee7] bg-white shadow-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="border-b border-[#edf0f4] px-6 py-4">
              <h2 className="text-xl font-semibold">Raw Logs</h2>
            </div>
            {logs.length === 0 ? (
              <p className="px-6 py-10 text-sm leading-6 text-[#667085]">
                No raw logs found for this error group.
              </p>
            ) : (
              <div className="divide-y divide-[#edf0f4] overflow-x-auto">
                <table className="w-full text-left text-sm text-[#475467]">
                  <thead className="bg-[#fcfcfd] text-xs uppercase tracking-wider text-[#667085]">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Timestamp</th>
                      <th className="px-6 py-3 font-semibold">Route</th>
                      <th className="px-6 py-3 font-semibold">Stack / Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f4] bg-white">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-[#fbfcfd]">
                        <td className="whitespace-nowrap px-6 py-4">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded bg-[#f2f4f7] px-2 py-0.5 text-xs font-medium text-[#344054]">
                            {log.route || "/"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#101828] mb-1">{log.message}</p>
                          {log.stack && (
                            <pre className="max-w-md overflow-x-auto rounded bg-[#f9fafb] p-2 text-xs text-[#475467]">
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
