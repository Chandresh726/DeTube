import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleRouteError } from '@/lib/server/http';
import { videoService } from '@/lib/server/services/videos';

export async function GET(req: NextRequest) {
  try {
    const videoId = z.string().trim().min(1).max(64).parse(
      new URL(req.url).searchParams.get('id'),
    );
    const data = await videoService.getDetails(videoId);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error, 'GET /api/video/data');
  }
}
