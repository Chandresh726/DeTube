import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { thanksSchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WALLET } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    rateLimitByUser('wallet:thanks', sessionUserId, RATE_LIMIT_MAX_WALLET);
    const body = thanksSchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);
    const headerKey = req.headers.get('idempotency-key') ?? req.headers.get('Idempotency-Key') ?? undefined;
    const idempotencyKey = body.idempotencyKey ?? headerKey ?? undefined;
    await walletService.thanks(userId, {
      channelId: body.channelId,
      amount: body.amount,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    return NextResponse.json({ success: true, message: 'Thank you transaction successful' });
  } catch (error) {
    return handleRouteError(error, 'POST /api/channel/thanks');
  }
}
