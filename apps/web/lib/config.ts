export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const GITHUB_AUTH_URL = `${API_BASE_URL}/auth/github`;
