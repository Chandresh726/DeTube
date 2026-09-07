import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { ZodError } from "zod";
import { logError, logWarn } from "./logger";

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "RATE_LIMITED"
  | "INTERNAL";

const STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/** Back-compat helper: some legacy clients expect bare objects. Prefer ok(). */
export function okBare<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function fail(code: ErrorCode, message: string, details?: unknown): NextResponse {
  const status = STATUS[code];
  return NextResponse.json({ error: { code, message, ...(details ? { details } : {}) } }, { status });
}

/** Legacy envelope used by existing frontend ({ error: string }). */
export function failLegacy(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function isPrismaError(e: unknown): e is Prisma.PrismaClientKnownRequestError {
  return e instanceof Prisma.PrismaClientKnownRequestError;
}

export function isPrismaCode(e: unknown, code: string): boolean {
  return isPrismaError(e) && e.code === code;
}

export function handleRouteError(error: unknown, route: string): NextResponse {
  if (error instanceof AppError) {
    if (error.status >= 500) logError(route, error.message, { code: error.code });
    else if (error.code === "FORBIDDEN" || error.code === "UNAUTHORIZED" || error.code === "CONFLICT") {
      logWarn(route, error.message, { code: error.code });
    }
    return fail(error.code, error.message, error.details);
  }
  if (error instanceof ZodError) {
    return fail("BAD_REQUEST", "Invalid request", error.flatten());
  }
  if (error instanceof SyntaxError) {
    return fail("BAD_REQUEST", "Malformed JSON body");
  }
  if (isPrismaError(error)) {
    switch (error.code) {
      case "P2002":
        return fail("CONFLICT", "Resource already exists");
      case "P2025":
        return fail("NOT_FOUND", "Resource not found");
      case "P2003":
        return fail("NOT_FOUND", "Referenced resource not found");
      default:
        logError(route, `Prisma ${error.code}`, error.message);
        return fail("INTERNAL", "Internal server error");
    }
  }
  logError(route, error instanceof Error ? error.message : "Unknown error", error);
  return fail("INTERNAL", "Internal server error");
}

/** Wrap a route handler so thrown AppError/Zod/Prisma errors map to JSON consistently. */
export function withErrorHandling<T extends unknown[]>(
  route: string,
  handler: (...args: T) => Promise<NextResponse>,
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleRouteError(error, route);
    }
  };
}
