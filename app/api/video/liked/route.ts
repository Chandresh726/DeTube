import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertQueryOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { paginationSchema } from '@/lib/server/validation';
import { videoService } from '@/lib/server/services/videos';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const params = new URL(req.url).searchParams;
    assertQueryOwnership(sessionUserId, params.get('id'), 'liked videos');
    const { page, limit } = paginationSchema.parse({
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
    });
    const videos = await videoService.getLiked(sessionUserId, page, limit);
    return NextResponse.json({ videos });
  } catch (error) {
    return handleRouteError(error, 'GET /api/video/liked');
  }
}
