import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleRouteError } from '@/lib/server/http';
import { channelService } from '@/lib/server/services/channels';

export async function GET(req: NextRequest) {
  try {
    const id = z.coerce.number().int().positive().parse(
      new URL(req.url).searchParams.get('id'),
    );
    const channel = await channelService.getById(id);
    return NextResponse.json(channel);
  } catch (error) {
    return handleRouteError(error, 'GET /api/channel/data');
  }
}
