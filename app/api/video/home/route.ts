import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/server/http';
import { paginationSchema } from '@/lib/server/validation';
import { videoService } from '@/lib/server/services/videos';

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const { page, limit } = paginationSchema.parse({
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
    });
    const data = await videoService.getHome(page, limit);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error, 'GET /api/video/home');
  }
}
