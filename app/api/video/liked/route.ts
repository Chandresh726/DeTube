import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertQueryOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { videoService } from '@/lib/server/services/videos';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const params = new URL(req.url).searchParams;
    assertQueryOwnership(sessionUserId, params.get('id'), 'liked videos');
    const pageParam = params.get('page');
    const limitParam = params.get('limit');
    const videos = await videoService.getLiked(
      sessionUserId,
      pageParam !== null ? Number(pageParam) : undefined,
      limitParam !== null ? Number(limitParam) : undefined,
    );
    return NextResponse.json({ videos });
  } catch (error) {
    return handleRouteError(error, 'GET /api/video/liked');
  }
}
