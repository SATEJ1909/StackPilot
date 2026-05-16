import { Redis, type RedisOptions } from "ioredis";

const REDIS_CONNECT_TIMEOUT_MS = 10_000;
const REDIS_COMMAND_TIMEOUT_MS = 5_000;
const REDIS_RETRY_DELAY_MS = 500;
const REDIS_MAX_RETRY_DELAY_MS = 5_000;

const rawRedisUrl = process.env.REDIS_URL?.trim().replace(/^['"]|['"]$/g, "");

const parseRedisUrl = () => {
  if (!rawRedisUrl) {
    console.warn("[Redis] REDIS_URL is not set; Redis-backed features are disabled.");
    return null;
  }

  try {
    const url = new URL(rawRedisUrl);

    if (!["redis:", "rediss:"].includes(url.protocol)) {
      console.warn(`[Redis] REDIS_URL must start with redis:// or rediss://. Received: ${url.protocol}`);
      return null;
    }

    if (url.protocol !== "rediss:") {
      console.warn("[Redis] REDIS_URL is not using TLS. Upstash and most Redis Cloud TLS databases require rediss://.");
    }

    return url;
  } catch {
    console.warn("[Redis] REDIS_URL is invalid; Redis-backed features are disabled.");
    return null;
  }
};

const redisUrl = parseRedisUrl();

const maskRedisUrl = (url: URL) => {
  const auth = url.username ? `${url.username}:***@` : "";
  return `${url.protocol}//${auth}${url.hostname}${url.port ? `:${url.port}` : ""}`;
};

const baseRedisOptions = (name: string): RedisOptions => ({
  lazyConnect: false,
  enableOfflineQueue: true,
  connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
  tls: redisUrl?.protocol === "rediss:" ? { servername: redisUrl.hostname } : undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * REDIS_RETRY_DELAY_MS, REDIS_MAX_RETRY_DELAY_MS);

    if (times === 1 || times % 10 === 0) {
      console.warn(`[Redis:${name}] Reconnecting in ${delay}ms (attempt ${times})`);
    }

    return delay;
  },
  reconnectOnError: (error) => {
    if (error.message.includes("READONLY")) {
      return 2;
    }

    return false;
  },
});

const createRedisConnection = (name: string, options: RedisOptions = {}) => {
  if (!redisUrl) {
    return null;
  }

  const connection = new Redis(redisUrl.toString(), {
    ...baseRedisOptions(name),
    ...options,
  });

  console.log(`[Redis:${name}] Configured ${maskRedisUrl(redisUrl)} tls=${redisUrl.protocol === "rediss:"}`);

  connection.on("ready", () => {
    console.log(`[Redis:${name}] Connected`);
  });

  connection.on("error", (error) => {
    console.error(`[Redis:${name}] ${error.name}: ${error.message}`);
  });

  connection.on("end", () => {
    console.warn(`[Redis:${name}] Connection ended`);
  });

  return connection;
};

export const redisConnection = createRedisConnection("app", {
  commandTimeout: REDIS_COMMAND_TIMEOUT_MS,
  maxRetriesPerRequest: 2,
});

export const rateLimitRedisConnection = createRedisConnection("rate-limit", {
  commandTimeout: REDIS_COMMAND_TIMEOUT_MS,
  maxRetriesPerRequest: 2,
});

export const bullQueueRedisConnection = createRedisConnection("bullmq-queue", {
  maxRetriesPerRequest: null,
});

export const bullWorkerRedisConnection = createRedisConnection("bullmq-worker", {
  maxRetriesPerRequest: null,
});

export const isRedisReady = () => redisConnection?.status === "ready";

export const redisGet = async (key: string) => {
  if (!isRedisReady()) {
    return null;
  }

  return redisConnection!.get(key);
};

export const redisSetEx = async (key: string, seconds: number, value: string) => {
  if (!isRedisReady()) {
    return false;
  }

  await redisConnection!.setex(key, seconds, value);
  return true;
};
