import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { walletCheckSchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WALLET } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    rateLimitByUser('wallet:check', sessionUserId, RATE_LIMIT_MAX_WALLET);
    const body = walletCheckSchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);
    const result = await walletService.check(userId, body.publicKey);
    // Minimal response: never leak full wallet rows (fixes over-exposure).
    return NextResponse.json({ success: true, walletExists: result.walletExists });
  } catch (error) {
    return handleRouteError(error, 'POST /api/wallet/check');
  }
}
