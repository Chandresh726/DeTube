import { AppError } from "./http";
import { RATE_LIMIT_WINDOW_MS } from "./env";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function hit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > max) {
    throw new AppError("RATE_LIMITED", "Too many requests, please retry later");
  }
}

/** In-memory token bucket. For multi-instance prod, replace with Redis/Upstash. */
export function rateLimit(key: string, max: number, windowMs = RATE_LIMIT_WINDOW_MS): void {
  hit(key, max, windowMs);
}

export function rateLimitByUser(prefix: string, userId: number, max: number, windowMs = RATE_LIMIT_WINDOW_MS): void {
  hit(`${prefix}:${userId}`, max, windowMs);
}

export function rateLimitByIp(prefix: string, ip: string | null, max: number, windowMs = RATE_LIMIT_WINDOW_MS): void {
  hit(`${prefix}:${ip ?? "unknown"}`, max, windowMs);
}

export function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}
