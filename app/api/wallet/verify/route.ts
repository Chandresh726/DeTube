import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { walletVerifySchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WALLET } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    rateLimitByUser('wallet:verify', sessionUserId, RATE_LIMIT_MAX_WALLET);
    const body = walletVerifySchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);
    const result = await walletService.verifyOwnership(userId, body);
    if (result.status === 'exists') {
      return NextResponse.json({ isVerified: true, message: 'Wallet already verified' });
    }
    return NextResponse.json({ isVerified: true, message: 'Wallet verified and added to the database' });
  } catch (error) {
    return handleRouteError(error, 'POST /api/wallet/verify');
  }
}
