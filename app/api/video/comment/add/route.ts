import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { commentAddSchema } from '@/lib/server/validation';
import { commentService } from '@/lib/server/services/social';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const body = commentAddSchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);
    const comment = await commentService.add(body.videoId, userId, body.content);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'POST /api/video/comment/add');
  }
}
