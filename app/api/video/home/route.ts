import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/server/http';
import { paginationSchema } from '@/lib/server/validation';
import { videoService } from '@/lib/server/services/videos';
import { getClientIp, rateLimitByIp } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_READ } from '@/lib/server/env';

export async function GET(req: NextRequest) {
  try {
    rateLimitByIp('read:video/home', getClientIp(req), RATE_LIMIT_MAX_READ);
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
