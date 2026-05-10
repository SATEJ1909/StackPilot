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
