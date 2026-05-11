type LoggerConfig = {
  projectKey: string;
  endpoint: string;
};

type ErrorPayload = {
  projectKey: string;
  message: string;
  stack?: string;
  route: string;
  timestamp: string;
};

let config: LoggerConfig | null = null;
let previousOnError: OnErrorEventHandler | null = null;
let rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

const getRoute = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
};

const sendLog = async (payload: ErrorPayload) => {
  try {
    await fetch(config!.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Logging should never break the app.
  }
};

export const logError = async (error: unknown) => {
  if (!config) {
    return;
  }

  const message =
    error instanceof Error ? error.message : String(error || "Unknown error");

  const stack = error instanceof Error ? error.stack : undefined;

  await sendLog({
    projectKey: config.projectKey,
    message,
    stack,
    route: getRoute(),
    timestamp: new Date().toISOString(),
  });
};

export const initLogger = (options: LoggerConfig) => {
  config = options;

  if (typeof window === "undefined") {
    return;
  }

  if (rejectionHandler) {
    return;
  }

  previousOnError = window.onerror;

  window.onerror = (message, source, line, column, error) => {
    logError(
      error ||
        new Error(
          `${String(message)} at ${source || "unknown"}:${line || 0}:${
            column || 0
          }`,
        ),
    );

    if (typeof previousOnError === "function") {
      return previousOnError(message, source, line, column, error);
    }

    return false;
  };

  rejectionHandler = (event) => {
    logError(event.reason);
  };

  window.addEventListener("unhandledrejection", rejectionHandler);
};

export const resetLogger = () => {
  config = null;

  if (typeof window === "undefined") {
    return;
  }

  window.onerror = previousOnError;
  previousOnError = null;

  if (rejectionHandler) {
    window.removeEventListener("unhandledrejection", rejectionHandler);
    rejectionHandler = null;
  }
};
