import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { channelRegisterSchema } from '@/lib/server/validation';
import { channelService } from '@/lib/server/services/channels';
import { isHttpsUrlFromPublicBucket } from '@/lib/server/storage';
import { AppError } from '@/lib/server/http';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WRITE } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    rateLimitByUser('channel:register', sessionUserId, RATE_LIMIT_MAX_WRITE);
    const body = channelRegisterSchema.parse(await req.json());
    const ownerUserId = assertOwnership(sessionUserId, body.userId);
    if (!isHttpsUrlFromPublicBucket(body.logo)) {
      throw new AppError('BAD_REQUEST', 'Channel logo must be from the configured storage bucket');
    }
    const channel = await channelService.register(ownerUserId, body);
    return NextResponse.json({ channelId: channel.id }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'POST /api/channel/register');
  }
}
