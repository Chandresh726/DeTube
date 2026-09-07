import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { withdrawSchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WALLET } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    rateLimitByUser('wallet:withdraw', sessionUserId, RATE_LIMIT_MAX_WALLET);
    const body = withdrawSchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);
    const idempotencyKey =
      body.idempotencyKey ?? req.headers.get('idempotency-key') ?? req.headers.get('Idempotency-Key') ?? undefined;
    const { signature } = await walletService.withdraw(userId, {
      walletAddress: body.walletAddress,
      amount: body.amount,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    return NextResponse.json({ success: true, message: 'Withdrawal successful', signature });
  } catch (error) {
    return handleRouteError(error, 'POST /api/wallet/withdraw');
  }
}
