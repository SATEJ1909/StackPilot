# StackPilot SDK

Browser error logging SDK for StackPilot.

## Install

```sh
npm install @stackpilot/sdk
```

```sh
pnpm add @stackpilot/sdk
```

## Setup

Initialize the SDK once in your client entry point.

```ts
import { initLogger } from "@stackpilot/sdk";

initLogger({
  projectKey: "YOUR_PROJECT_KEY",
  endpoint: "https://stackpilot-oiys.onrender.com/api/v1/logs",
});
```

The SDK automatically captures:

- uncaught browser errors from `window.onerror`
- unhandled promise rejections

## Manual Logging

```ts
import { captureError, logError } from "@stackpilot/sdk";

try {
  // app code
} catch (error) {
  logError(error);
}

captureError(new Error("Checkout failed"));
```

## Environment Variables

For frontend frameworks, expose the project key and endpoint through public client environment variables.

```ts
import { initLogger } from "@stackpilot/sdk";

initLogger({
  projectKey: process.env.NEXT_PUBLIC_STACKPILOT_PROJECT_KEY!,
  endpoint: process.env.NEXT_PUBLIC_STACKPILOT_ENDPOINT!,
});
```

Example values:

```txt
NEXT_PUBLIC_STACKPILOT_PROJECT_KEY=your-project-key
NEXT_PUBLIC_STACKPILOT_ENDPOINT=https://stackpilot-oiys.onrender.com/api/v1/logs
```

## Options

```ts
type LoggerConfig = {
  projectKey: string;
  endpoint: string;
  enabled?: boolean;
  debug?: boolean;
};
```

- `projectKey`: project key from the StackPilot dashboard.
- `endpoint`: full log ingestion endpoint, ending in `/api/v1/logs`.
- `enabled`: set to `false` to disable capture without removing setup code.
- `debug`: set to `true` to print SDK warnings in the browser console.

## Cleanup

`initLogger` returns a cleanup function. This is useful in tests or temporary client mounts.

```ts
const cleanup = initLogger({
  projectKey: "YOUR_PROJECT_KEY",
  endpoint: "https://stackpilot-oiys.onrender.com/api/v1/logs",
});

cleanup();
```

You can also call:

```ts
import { resetLogger } from "@stackpilot/sdk";

resetLogger();
```

## Publishing

Build and validate before publishing:

```sh
pnpm build
npm publish --access public
```

The package publishes only `dist`, `README.md`, and `LICENSE`.

## Troubleshooting

If logs do not appear:

- confirm the endpoint is `https://stackpilot-oiys.onrender.com/api/v1/logs`
- confirm the project key exists in your StackPilot dashboard
- confirm the backend CORS config allows your frontend origin
- enable `debug: true` and check the browser console
