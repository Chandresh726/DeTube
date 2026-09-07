import { NextResponse } from "next/server";
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
  const n = Number(suppliedId);
  if (!Number.isInteger(n) || n <= 0) {
    throw new AppError("BAD_REQUEST", `Invalid ${field}`);
  }
  if (n !== sessionUserId) {
    throw new AppError("FORBIDDEN", "Cannot act on behalf of another user");
  }
  return n;
}

/** Legacy helper kept for incremental migration (returns NextResponse on failure). */
export async function authenticateUserLegacy(): Promise<AuthContext | NextResponse> {
  try {
    return await requireSession();
  } catch (e) {
    if (e instanceof AppError && e.code === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    throw e;
  }
}
