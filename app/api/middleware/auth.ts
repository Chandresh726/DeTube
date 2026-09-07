import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { AppError } from '@/lib/server/http';

/**
 * Legacy auth guard (kept for backward compat).
 * New code should use `requireSession()` + `assertOwnership()` directly,
 * which throw typed AppError instead of the Session|NextResponse union
 * (fixes the LSP violation where every caller branched on instanceof).
 */
export async function authenticateUser(_req: NextRequest) {
  try {
    return await requireSession();
  } catch (e) {
    if (e instanceof AppError && e.code === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    throw e;
  }
}
