import { AppError } from './http';
import { RATE_LIMIT_WINDOW_MS } from './env';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10000;

function evict(now: number): void {
  if (buckets.size < MAX_BUCKETS) {
    // Opportunistic cleanup of a few expired entries per hit.
    let checked = 0;
    for (const [k, v] of buckets) {
      if (++checked > 20) break;
      if (now >= v.resetAt) buckets.delete(k);
    }
    return;
  }
  for (const [k, v] of buckets) {
    if (now >= v.resetAt) buckets.delete(k);
  }
  if (buckets.size >= MAX_BUCKETS) {
    // Bound memory under attack: drop oldest inserts.
    const overflow = buckets.size - MAX_BUCKETS + 1;
    let n = 0;
    for (const k of buckets.keys()) {
      buckets.delete(k);
      if (++n >= overflow) break;
    }
  }
}

function hit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  evict(now);
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > max) {
    throw new AppError('RATE_LIMITED', 'Too many requests, please retry later');
  }
}

/** In-memory token bucket. For multi-instance prod, replace with Redis/Upstash. */
export function rateLimit(key: string, max: number, windowMs = RATE_LIMIT_WINDOW_MS): void {
  hit(key, max, windowMs);
}

export function rateLimitByUser(
  prefix: string,
  userId: number,
  max: number,
  windowMs = RATE_LIMIT_WINDOW_MS,
): void {
  hit(`${prefix}:${userId}`, max, windowMs);
}

export function rateLimitByIp(
  prefix: string,
  ip: string | null,
  max: number,
  windowMs = RATE_LIMIT_WINDOW_MS,
): void {
  hit(`${prefix}:${ip ?? 'unknown'}`, max, windowMs);
}

export function getClientIp(req: Request): string | null {
  // NOTE: x-forwarded-for is spoofable. Only trust it when behind a configured
  // proxy (Vercel sets x-real-ip / x-forwarded-for). Prefer x-real-ip first.
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim().split(',')[0]?.trim() ?? null;
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  return null;
}

/** Test seam: clear in-memory buckets. */
export function __resetRateLimits(): void {
  buckets.clear();
}
