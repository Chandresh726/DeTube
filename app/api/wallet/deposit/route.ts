import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { depositSchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WALLET } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    rateLimitByUser('wallet:deposit', sessionUserId, RATE_LIMIT_MAX_WALLET);
    const body = depositSchema.parse(await req.json());
    const result = await walletService.deposit(sessionUserId, {
      address: body.address,
      amount: body.amount as bigint,
      signature: body.signature,
    });
    return NextResponse.json({ success: result.status === 'SUCCESS', status: result.status });
  } catch (error) {
    return handleRouteError(error, 'POST /api/wallet/deposit');
  }
}
