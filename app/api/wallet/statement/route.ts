import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertQueryOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { walletService } from '@/lib/server/services/wallet';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const params = new URL(req.url).searchParams;
    assertQueryOwnership(sessionUserId, params.get('id'), 'statement');
    const typeParam = params.get('type');
    const type =
      typeParam === 'DEPOSIT' || typeParam === 'WITHDRAWAL' || typeParam === 'THANKS' ? typeParam : undefined;
    const pageParam = params.get('page');
    const limitParam = params.get('limit');
    const grouped = await walletService.getStatement(sessionUserId, {
      ...(type ? { type } : {}),
      ...(pageParam !== null || limitParam !== null
        ? {
            page: pageParam ? Number(pageParam) : 1,
            limit: limitParam ? Number(limitParam) : 200,
          }
        : {}),
    });
    return NextResponse.json(grouped);
  } catch (error) {
    return handleRouteError(error, 'GET /api/wallet/statement');
  }
}
