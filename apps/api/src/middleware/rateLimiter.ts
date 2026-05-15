import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisConnection } from "../lib/ioredis.js";

// Global rate limiter for the API to prevent abuse
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore({
    // @ts-expect-error - rate-limit-redis has some strict type definitions that don't always align with ioredis, but it works
    sendCommand: (...args: string[]) => redisConnection.call(...args),
  }),
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
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redisConnection.call(...args),
  }),
  message: {
    error: "AI analysis rate limit exceeded. Please wait a minute.",
  },
});
