import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleRouteError } from '@/lib/server/http';
import { paginationSchema } from '@/lib/server/validation';
import { commentService } from '@/lib/server/services/social';

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const videoId = z.string().trim().min(1).max(64).parse(params.get('id'));
    const { page, limit } = paginationSchema.parse({
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
    });
    const comments = await commentService.list(videoId, page, limit);
    return NextResponse.json({ comments });
  } catch (error) {
    return handleRouteError(error, 'GET /api/video/comment/get');
  }
}
