import rateLimit from "express-rate-limit";
import RedisStore, { type RedisReply } from "rate-limit-redis";
import { rateLimitRedisConnection } from "../lib/ioredis.js";

const createRedisStore = (prefix: string) =>
  rateLimitRedisConnection
    ? new RedisStore({
        prefix,
        sendCommand: (command: string, ...args: string[]) =>
          rateLimitRedisConnection.call(command, ...args) as Promise<RedisReply>,
      })
    : undefined;

// Global rate limiter for the API to prevent abuse
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createRedisStore("rl:global:"),
  passOnStoreError: true,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Stricter rate limiter specifically for AI log analysis (since it costs money)
export const aiAnalysisRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 analysis requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:ai-analysis:"),
  passOnStoreError: true,
  message: {
    error: "AI analysis rate limit exceeded. Please wait a minute.",
  },
});
