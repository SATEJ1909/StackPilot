import type { Request, RequestHandler } from "express";

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

type RateLimitOptions = {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: Request) => string;
};

const buckets = new Map<string, RateLimitEntry>();

export const createRateLimiter = ({
    windowMs,
    maxRequests,
    keyGenerator,
}: RateLimitOptions): RequestHandler => {
    return (req, res, next) => {
        const now = Date.now();
        const key = keyGenerator?.(req) || req.ip || "unknown";
        const entry = buckets.get(key);

        if (!entry || entry.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            next();
            return;
        }

        if (entry.count >= maxRequests) {
            res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later.",
            });
            return;
        }

        entry.count += 1;
        next();
    };
};

setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of buckets.entries()) {
        if (entry.resetAt <= now) {
            buckets.delete(key);
        }
    }
}, 60_000).unref();
