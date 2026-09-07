import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { handleRouteError, fail } from '@/lib/server/http';
import { subscriptionService } from '@/lib/server/services/social';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const id = new URL(req.url).searchParams.get('id');
    if (id !== null && Number(id) !== sessionUserId) {
      return fail('FORBIDDEN', 'Cannot read another user\'s subscriptions');
    }
    const subscriptions = await subscriptionService.listForUser(sessionUserId);
    return NextResponse.json({ subscriptions });
  } catch (error) {
    return handleRouteError(error, 'GET /api/subscriptions/data');
  }
}
