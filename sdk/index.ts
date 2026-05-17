export type LoggerConfig = {
  projectKey: string;
  endpoint: string;
  enabled?: boolean;
  debug?: boolean;
};

export type ErrorPayload = {
  projectKey: string;
  message: string;
  stack?: string;
  route: string;
  timestamp: string;
};

export type StackPilotErrorInput = unknown;

let config: LoggerConfig | null = null;
let previousOnError: OnErrorEventHandler | null = null;
let rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_STACK_LENGTH = 20_000;

const getRoute = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
};

const normalizeEndpoint = (endpoint: string) => endpoint.trim();

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
};

const toErrorDetails = (error: StackPilotErrorInput) => {
  if (error instanceof Error) {
    return {
      message: truncate(error.message || "Unknown error", MAX_MESSAGE_LENGTH),
      stack: error.stack
        ? truncate(error.stack, MAX_STACK_LENGTH)
        : undefined,
    };
  }

  if (typeof error === "string") {
    return {
      message: truncate(error || "Unknown error", MAX_MESSAGE_LENGTH),
      stack: undefined,
    };
  }

  try {
    return {
      message: truncate(JSON.stringify(error), MAX_MESSAGE_LENGTH),
      stack: undefined,
    };
  } catch {
    return {
      message: "Unknown error",
      stack: undefined,
    };
  }
};

const warn = (message: string) => {
  if (config?.debug && typeof console !== "undefined") {
    console.warn(`[StackPilot] ${message}`);
  }
};

const isConfigured = () => {
  if (!config || config.enabled === false) {
    return false;
  }

  if (!config.projectKey.trim()) {
    warn("Missing projectKey.");
    return false;
  }

  if (!config.endpoint.trim()) {
    warn("Missing endpoint.");
    return false;
  }

  return true;
};

const sendLog = async (payload: ErrorPayload) => {
  if (!isConfigured()) {
    return;
  }

  try {
    await fetch(normalizeEndpoint(config!.endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    warn(error instanceof Error ? error.message : "Failed to send log.");
    // Logging should never break the app.
  }
};

export const logError = async (error: StackPilotErrorInput) => {
  if (!isConfigured()) {
    return;
  }

  const { message, stack } = toErrorDetails(error);

  await sendLog({
    projectKey: config!.projectKey.trim(),
    message,
    stack,
    route: getRoute(),
    timestamp: new Date().toISOString(),
  });
};

export const captureError = logError;

export const initLogger = (options: LoggerConfig) => {
  config = {
    ...options,
    endpoint: normalizeEndpoint(options.endpoint),
  };

  if (!isConfigured()) {
    return resetLogger;
  }

  if (typeof window === "undefined") {
    return resetLogger;
  }

  if (rejectionHandler) {
    return resetLogger;
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

  return resetLogger;
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
