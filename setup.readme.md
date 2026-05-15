# StackPilot Setup Guide

This guide explains how to set up StackPilot as a platform and how another application should use the `@stackpilot/sdk` package to send browser error logs.

StackPilot has three main parts:

- `apps/api`: Express API for auth, projects, log ingestion, error grouping, queues, and AI analysis.
- `apps/web`: Next.js frontend dashboard.
- `sdk`: Browser SDK used by customer applications to send errors to StackPilot.

## Requirements

Install these before running the project:

- Node.js `18+`
- pnpm `9+`
- MongoDB database
- Redis instance
- GitHub OAuth app
- OpenRouter API key

## 1. Install Dependencies

From the repository root:

```sh
pnpm install
```

## 2. Configure API Environment Variables

Create an `.env` file for the API app. The API loads environment variables through `dotenv`.

Required variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@HOST/DATABASE
JWT_SECRET=replace_with_a_strong_secret
GITHUB_CLIENT_ID=replace_with_github_oauth_client_id
GITHUB_CLIENT_SECRET=replace_with_github_oauth_client_secret
OPENROUTER_API_KEY=replace_with_openrouter_api_key
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

For production, replace `FRONTEND_URL` and `CORS_ORIGIN` with your deployed frontend domain:

```env
FRONTEND_URL=https://your-dashboard-domain.com
CORS_ORIGIN=https://your-dashboard-domain.com
```

## 3. Configure GitHub OAuth

Create a GitHub OAuth app and set the callback URL.

For local development:

```txt
http://localhost:5000/api/v1/auth/github/callback
```

For production:

```txt
https://your-api-domain.com/api/v1/auth/github/callback
```

The login flow starts at:

```txt
GET /api/v1/auth/github
```

After a successful login, the API redirects to:

```txt
FRONTEND_URL/auth/callback?token=...
```

## 4. Run The Project Locally

Run the full monorepo:

```sh
pnpm dev
```

Or run each app separately.

API:

```sh
pnpm --filter api dev
```

Web dashboard:

```sh
pnpm --filter web dev
```

Default local URLs:

```txt
API: http://localhost:5000
Web: http://localhost:3000
Log ingestion endpoint: http://localhost:5000/api/v1/logs
```

## 5. Create A Project

Users must create a project before using the SDK.

The project API is protected, so the user must authenticate first. After authentication, create a project:

```http
POST /api/v1/project
Authorization: Bearer USER_JWT
Content-Type: application/json

{
  "name": "My App",
  "repoUrl": "https://github.com/user/repo"
}
```

The API returns a project object that includes a `projectKey`.

Example:

```json
{
  "success": true,
  "data": {
    "name": "My App",
    "repoUrl": "https://github.com/user/repo",
    "projectKey": "generated_project_key"
  }
}
```

The `projectKey` is required when initializing the SDK.

## 6. Build The SDK

From the repository root:

```sh
pnpm --filter @stackpilot/sdk build
```

The SDK build output is written to:

```txt
sdk/dist
```

## 7. Publish Or Share The SDK

If the SDK should be available through npm:

```sh
cd sdk
npm publish --access public
```

If the SDK is private, publish it to your private package registry or install it from a Git repository/package tarball.

Users can only run this successfully after the package is available to them:

```sh
pnpm add @stackpilot/sdk
```

## 8. Use The SDK In Another App

Install the SDK in the customer/frontend application:

```sh
pnpm add @stackpilot/sdk
```

Add environment variables to that application.

For Next.js:

```env
NEXT_PUBLIC_STACKPILOT_PROJECT_KEY=generated_project_key
NEXT_PUBLIC_STACKPILOT_ENDPOINT=https://your-api-domain.com/api/v1/logs
```

For local testing:

```env
NEXT_PUBLIC_STACKPILOT_PROJECT_KEY=generated_project_key
NEXT_PUBLIC_STACKPILOT_ENDPOINT=http://localhost:5000/api/v1/logs
```

Initialize the logger once in a browser/client entry point:

```ts
import { initLogger } from "@stackpilot/sdk";

initLogger({
  projectKey: process.env.NEXT_PUBLIC_STACKPILOT_PROJECT_KEY!,
  endpoint: process.env.NEXT_PUBLIC_STACKPILOT_ENDPOINT!,
});
```

The SDK automatically captures:

- uncaught browser errors through `window.onerror`
- unhandled promise rejections through `unhandledrejection`

Manual logging is also supported:

```ts
import { logError } from "@stackpilot/sdk";

try {
  // application code
} catch (error) {
  logError(error);
}
```

## 9. Verify Logging

Add a temporary test button in the customer app:

```tsx
export function TestErrorButton() {
  return (
    <button
      type="button"
      onClick={() => {
        throw new Error("StackPilot test error");
      }}
    >
      Trigger test error
    </button>
  );
}
```

Open the app in the browser, click the button, and verify:

- the browser sends a `POST` request to `/api/v1/logs`
- the API responds with `Log queued successfully`
- Redis/BullMQ processes the log job
- MongoDB stores the log and error group
- the dashboard shows the error

## 10. Production Checklist

Before giving this to other users, confirm these items:

- API is deployed and reachable over HTTPS.
- Web dashboard is deployed and points to the correct API.
- MongoDB is available from the API server.
- Redis is available from the API server.
- GitHub OAuth callback URL matches the deployed API URL.
- `JWT_SECRET` is strong and private.
- `OPENROUTER_API_KEY` is set for AI error analysis.
- `CORS_ORIGIN` allows the dashboard and any expected SDK client origins.
- SDK is published or otherwise installable by users.
- Users can create projects and copy their `projectKey`.
- `POST /api/v1/logs` accepts SDK requests from deployed client apps.

## Troubleshooting

If logs do not appear:

1. Confirm the SDK is initialized in browser code, not server-only code.
2. Confirm `projectKey` matches an existing project.
3. Confirm `endpoint` points to `/api/v1/logs`.
4. Check browser network requests for CORS errors.
5. Check API logs for validation or queue errors.
6. Confirm Redis is connected and the BullMQ worker is running.
7. Confirm MongoDB is connected.
8. Confirm the error message is not over the API validation limits.

If project creation fails:

1. Confirm the user is authenticated.
2. Confirm the `Authorization: Bearer USER_JWT` header is present.
3. Confirm `name` is between 1 and 80 characters.
4. Confirm `repoUrl` is a valid `http` or `https` URL.
5. Confirm the repository URL is not already used by another project.

If GitHub login fails:

1. Confirm `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct.
2. Confirm the GitHub OAuth callback URL is correct.
3. Confirm `FRONTEND_URL` is set.
4. Confirm the GitHub account has a verified email.

## Minimal User Instructions

Give this short version to SDK users:

1. Create a StackPilot project.
2. Copy the generated `projectKey`.
3. Install the SDK:

```sh
pnpm add @stackpilot/sdk
```

4. Initialize it in your frontend:

```ts
import { initLogger } from "@stackpilot/sdk";

initLogger({
  projectKey: "YOUR_PROJECT_KEY",
  endpoint: "https://your-api-domain.com/api/v1/logs",
});
```

5. Trigger a test error and confirm it appears in StackPilot.
