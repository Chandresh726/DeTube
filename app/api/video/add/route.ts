import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { videoAddSchema } from '@/lib/server/validation';
import { videoService } from '@/lib/server/services/videos';
import { isHttpsUrlFromPublicBucket } from '@/lib/server/storage';
import { AppError } from '@/lib/server/http';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WRITE } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId: ownerUserId } = await requireSession();
    rateLimitByUser('video:add', ownerUserId, RATE_LIMIT_MAX_WRITE);
    const body = videoAddSchema.parse(await req.json());
    // Provenance check: media must come from our own bucket (prevents external malware hosts).
    if (!isHttpsUrlFromPublicBucket(body.thumbnail) || !isHttpsUrlFromPublicBucket(body.video)) {
      throw new AppError('BAD_REQUEST', 'Media URLs must be from the configured storage bucket');
    }
    const created = await videoService.add({ ...body, ownerUserId });
    return NextResponse.json({ message: 'Video created successfully', videoId: created.id }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'POST /api/video/add');
  }
}
