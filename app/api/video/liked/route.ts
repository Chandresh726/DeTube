import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { handleRouteError, fail } from '@/lib/server/http';
import { videoService } from '@/lib/server/services/videos';

export async function GET(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const id = new URL(req.url).searchParams.get('id');
    if (id !== null && Number(id) !== sessionUserId) {
      return fail('FORBIDDEN', 'Cannot read another user\'s liked videos');
    }
    const videos = await videoService.getLiked(sessionUserId);
    return NextResponse.json({ videos });
  } catch (error) {
    return handleRouteError(error, 'GET /api/video/liked');
  }
}
