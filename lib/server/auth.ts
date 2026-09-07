import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/util/auth";
import { AppError } from "./http";

export interface AuthContext {
  session: Session;
  /** Canonical numeric user id derived server-side from the session. */
  userId: number;
}

/**
 * Single auth entry-point for all API routes (fixes ISP violation where every
 * route branched on `Session | NextResponse`).
 *
 * Identity is always derived from the session — never from client-supplied
 * `userId`. Legacy `userId` fields are accepted during migration but MUST
 * match the session, otherwise FORBIDDEN is thrown.
 */
export async function requireSession(): Promise<AuthContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AppError("UNAUTHORIZED", "Authentication required");
  }
  const userId = Number(session.user.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError("UNAUTHORIZED", "Invalid session");
  }
  return { session, userId };
}

/**
 * Enforce that a legacy client-supplied id matches the session id.
 * Pass `undefined` when the client omitted the field (server uses session).
 */
export function assertOwnership(sessionUserId: number, suppliedId: unknown, field = "userId"): number {
  if (suppliedId === undefined || suppliedId === null || suppliedId === "") {
    return sessionUserId;
  }
  if (typeof suppliedId === "number") {
    if (!Number.isInteger(suppliedId) || suppliedId <= 0) {
      throw new AppError("BAD_REQUEST", `Invalid ${field}`);
    }
    if (suppliedId !== sessionUserId) {
      throw new AppError("FORBIDDEN", "Cannot act on behalf of another user");
    }
    return suppliedId;
  }
  if (typeof suppliedId === "string") {
    const trimmed = suppliedId.trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new AppError("BAD_REQUEST", `Invalid ${field}`);
    }
    const n = Number(trimmed);
    if (!Number.isSafeInteger(n) || n <= 0) {
      throw new AppError("BAD_REQUEST", `Invalid ${field}`);
    }
    if (n !== sessionUserId) {
      throw new AppError("FORBIDDEN", "Cannot act on behalf of another user");
    }
    return n;
  }
  throw new AppError("BAD_REQUEST", `Invalid ${field}`);
}

/**
 * Ownership guard for `?id=` query params on self-scoped GET routes.
 * Returns the session user id; throws FORBIDDEN on mismatch, BAD_REQUEST on malformed.
 * Backend-only helper — query `id` is redundant (identity comes from session) and
 * exists only for backward compat with existing frontend callers.
 */
export function assertQueryOwnership(sessionUserId: number, rawId: string | null, resource = "resource"): number {
  if (rawId === null || rawId === "") return sessionUserId;
  return assertOwnership(sessionUserId, rawId, "id");
}
