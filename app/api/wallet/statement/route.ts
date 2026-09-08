import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertQueryOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { paginationSchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const params = new URL(req.url).searchParams;
    assertQueryOwnership(sessionUserId, params.get('id'), 'statement');
    const typeParam = params.get('type');
    const type =
      typeParam === 'DEPOSIT' || typeParam === 'WITHDRAWAL' || typeParam === 'THANKS' ? typeParam : undefined;
    // Always paginate + cap via shared schema (DoS guard: was raw Number(), unbounded).
    const { page, limit } = paginationSchema.parse({
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
    });
    const grouped = await walletService.getStatement(sessionUserId, {
      ...(type ? { type } : {}),
      page,
      limit,
    });
    return NextResponse.json(grouped);
  } catch (error) {
    return handleRouteError(error, 'GET /api/wallet/statement');
  }
}
