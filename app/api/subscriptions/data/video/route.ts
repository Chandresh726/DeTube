import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { handleRouteError, fail } from '@/lib/server/http';
import { paginationSchema } from '@/lib/server/validation';
import { subscriptionService } from '@/lib/server/services/social';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const params = new URL(req.url).searchParams;
    const id = params.get('id');
    if (id !== null && Number(id) !== sessionUserId) {
      return fail('FORBIDDEN', 'Cannot read another user\'s feed');
    }
    const { page, limit } = paginationSchema.parse({
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
    });
    const videos = await subscriptionService.feedForUser(sessionUserId, page, limit);
    return NextResponse.json({ videos });
  } catch (error) {
    return handleRouteError(error, 'GET /api/subscriptions/data/video');
  }
}
