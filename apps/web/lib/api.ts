"use client";

import { API_BASE_URL } from "@/lib/config";
import { clearToken, getToken } from "@/lib/auth";

export type Project = {
  _id: string;
  name: string;
  repoUrl: string;
  projectKey: string;
  createdAt: string;
};

export type ProjectList = {
  projects: Project[];
  totalPages: number;
  currentPage: number;
  totalProjects: number;
};

export type ErrorGroup = {
  _id: string;
  message: string;
  route?: string;
  affectedRoutes?: string[];
  count: number;
  lastSeenAt: string;
  cause?: string;
  fix?: string[];
  type?: "frontend" | "backend" | "fullstack";
  reasoning?: string;
  severity: "low" | "medium" | "high";
  aiAnalyzed: "pending" | "processing" | "done";
  createdAt: string;
};

export type AnalyzeResult = {
  type: "frontend" | "backend" | "fullstack";
  reasoning: string;
  cause: string;
  fix: string[];
  severity: "low" | "medium" | "high";
};

type ApiEnvelope<T> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      message?: string;
      error?: string;
    };

const request = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getToken();

  if (!token) {
    throw new Error("Sign in is required");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    clearToken();
    throw new Error("Session expired. Sign in again.");
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!payload.success) {
    throw new Error(payload.message || payload.error || "API request failed");
  }

  if (!response.ok) {
    throw new Error(payload.message || "API request failed");
  }

  return payload.data;
};

export const fetchProjects = (page = 1, limit = 10) => {
  return request<ProjectList>(`/project?page=${page}&limit=${limit}`);
};

export const fetchProject = (projectId: string) => {
  return request<Project>(`/project/${projectId}`);
};

export const createProject = (data: { name: string; repoUrl: string }) => {
  return request<Project>("/project", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const deleteProject = async (projectId: string) => {
  await request<{ message?: string }>(`/project/${projectId}`, {
    method: "DELETE",
  });
};

export const fetchErrorGroups = (projectId: string) => {
  return request<{ errors: ErrorGroup[] }>(
    `/error?projectId=${encodeURIComponent(projectId)}`,
  );
};

export const analyzeError = (data: {
  message: string;
  stack?: string;
  route?: string;
}) => {
  return request<AnalyzeResult>("/error/analyze", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
