import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { withdrawSchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const body = withdrawSchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);
    const { signature } = await walletService.withdraw(userId, {
      walletAddress: body.walletAddress,
      amount: body.amount,
    });
    return NextResponse.json({ success: true, message: 'Withdrawal successful', signature });
  } catch (error) {
    return handleRouteError(error, 'POST /api/wallet/withdraw');
  }
}
