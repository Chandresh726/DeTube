import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/server/http';
import { channelService } from '@/lib/server/services/channels';
import { channelIdSchema, paginationSchema } from '@/lib/server/validation';

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const id = channelIdSchema.parse(params.get('id'));
    const pageParam = params.get('page');
    const limitParam = params.get('limit');
    let page: number | undefined;
    let limit: number | undefined;
    if (pageParam !== null || limitParam !== null) {
      const parsed = paginationSchema.parse({
        page: pageParam ?? undefined,
        limit: limitParam ?? undefined,
      });
      page = parsed.page;
      limit = parsed.limit;
    }
    const channel = await channelService.getById(id, page, limit);
    return NextResponse.json(channel);
  } catch (error) {
    return handleRouteError(error, 'GET /api/channel/data');
  }
}
