export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://stackpilot-oiys.onrender.com/api/v1";

export const SOCKET_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const GITHUB_AUTH_URL = `${API_BASE_URL}/auth/github`;
