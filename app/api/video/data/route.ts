import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/server/http';
import { videoService } from '@/lib/server/services/videos';
import { videoIdString } from '@/lib/server/validation';

export async function GET(req: NextRequest) {
  try {
    const videoId = videoIdString.parse(new URL(req.url).searchParams.get('id'));
    const data = await videoService.getDetails(videoId);
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error, 'GET /api/video/data');
  }
}
