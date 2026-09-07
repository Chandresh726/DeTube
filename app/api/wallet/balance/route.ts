import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { handleRouteError, fail } from '@/lib/server/http';
import { walletService } from '@/lib/server/services/wallet';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const id = new URL(req.url).searchParams.get('id');
    // Identity comes from the session; a supplied id must match (prevents balance oracle).
    if (id !== null && Number(id) !== sessionUserId) {
      return fail('FORBIDDEN', 'Cannot read another user\'s balance');
    }
    const balance = await walletService.getBalance(sessionUserId);
    return NextResponse.json(balance);
  } catch (error) {
    return handleRouteError(error, 'GET /api/wallet/balance');
  }
}
