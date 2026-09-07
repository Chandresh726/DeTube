import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertQueryOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { subscriptionService } from '@/lib/server/services/social';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const params = new URL(req.url).searchParams;
    assertQueryOwnership(sessionUserId, params.get('id'), 'subscriptions');
    const pageParam = params.get('page');
    const limitParam = params.get('limit');
    const subscriptions = await subscriptionService.listForUser(
      sessionUserId,
      pageParam !== null ? Number(pageParam) : undefined,
      limitParam !== null ? Number(limitParam) : undefined,
    );
    return NextResponse.json({ subscriptions });
  } catch (error) {
    return handleRouteError(error, 'GET /api/subscriptions/data');
  }
}
