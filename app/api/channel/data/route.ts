import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/server/http';
import { channelService } from '@/lib/server/services/channels';
import { channelIdSchema, paginationSchema } from '@/lib/server/validation';
import { getClientIp, rateLimitByIp } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_READ } from '@/lib/server/env';

export async function GET(req: NextRequest) {
  try {
    rateLimitByIp('read:channel/data', getClientIp(req), RATE_LIMIT_MAX_READ);
    const params = new URL(req.url).searchParams;
    const id = channelIdSchema.parse(params.get('id'));
    const { page, limit } = paginationSchema.parse({
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
    });
    const channel = await channelService.getById(id, page, limit);
    return NextResponse.json(channel);
  } catch (error) {
    return handleRouteError(error, 'GET /api/channel/data');
  }
}
