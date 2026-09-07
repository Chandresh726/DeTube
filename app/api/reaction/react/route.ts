import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { reactionLegacySchema } from '@/lib/server/validation';
import { reactionService } from '@/lib/server/services/social';

/**
 * Canonical reaction endpoint (authenticated).
 * Legacy { status: check|like|dislike|remove } contract preserved for the
 * existing frontend; new clients should use /api/video/reaction instead.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const body = reactionLegacySchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);

    if (body.status === 'check') {
      const reactionType = await reactionService.get(body.videoId, userId);
      return NextResponse.json({ reactionType });
    }
    if (body.status === 'like' || body.status === 'dislike') {
      const type = body.status === 'like' ? 'LIKE' : 'DISLIKE';
      const result = await reactionService.set(body.videoId, userId, type);
      if (result.status === 'exists' || result.status === 'updated') {
        return NextResponse.json({ reactionType: type });
      }
      return NextResponse.json({ reactionType: type }, { status: 201 });
    }
    // remove
    await reactionService.remove(body.videoId, userId);
    return NextResponse.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    return handleRouteError(error, 'POST /api/reaction/react');
  }
}
