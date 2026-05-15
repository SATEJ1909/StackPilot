# StackPilot SDK

Browser error logger for StackPilot.

## Install

```sh
pnpm add @stackpilot/sdk
```

## Setup

Initialize the SDK once in your client entry point.

```ts
import { initLogger } from "@stackpilot/sdk";

initLogger({
  projectKey: "YOUR_PROJECT_KEY",
  endpoint: "http://localhost:5000/api/v1/logs",
});
```

## Manual Logging

```ts
import { logError } from "@stackpilot/sdk";

try {
  // app code
} catch (error) {
  logError(error);
}
```

## Post-deployment — How users should set up and use this project

- **Create a project / get a key:** Obtain the `PROJECT_KEY` for your deployed StackPilot instance (from the admin UI or provisioning step).
- **Set production env vars:** Add the key and endpoint to your hosting provider (Vercel, Netlify, etc.). Example env names:
  - `NEXT_PUBLIC_STACKPILOT_PROJECT_KEY` = your project key
  - `NEXT_PUBLIC_STACKPILOT_ENDPOINT` = https://your-production-domain.com/api/v1/logs
- **Enable CORS / network access:** Ensure the deployed API accepts requests from your web origin or is behind a proxy that forwards requests.
- **Install & initialize in the deployed client:** Use the SDK and read env vars at runtime. Example:

```ts
import { initLogger } from "@stackpilot/sdk";

initLogger({
  projectKey: process.env.NEXT_PUBLIC_STACKPILOT_PROJECT_KEY!,
  endpoint: process.env.NEXT_PUBLIC_STACKPILOT_ENDPOINT!,
});
```
- **Verify logging:** Trigger a test error in the deployed site and confirm it appears in the API logs or admin UI.
- **Optional: source maps:** If you want readable stack traces, upload source maps to your deployment pipeline or the StackPilot service (if supported).
- **Rotate keys & monitor:** Rotate project keys if needed and monitor rate limits, error volume, and CORS/network errors.

- **Troubleshooting checklist:** If logs don't appear, verify (1) correct `endpoint`, (2) valid `projectKey`, (3) CORS allowed for your origin, (4) network/firewall rules, (5) API is healthy.
