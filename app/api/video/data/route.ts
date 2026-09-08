import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/server/http';
import { videoService } from '@/lib/server/services/videos';
import { videoIdString } from '@/lib/server/validation';
import { getClientIp, rateLimitByIp } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_VIEW } from '@/lib/server/env';

export async function GET(req: NextRequest) {
  try {
    // View increments on every hit: rate-limit per IP to blunt inflation/cost.
    rateLimitByIp('read:video/data', getClientIp(req), RATE_LIMIT_MAX_VIEW);
    const videoId = videoIdString.parse(new URL(req.url).searchParams.get('id'));
    const data = await videoService.getDetails(videoId);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error, 'GET /api/video/data');
  }
}
