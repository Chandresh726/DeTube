import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { reactionSetSchema } from '@/lib/server/validation';
import { reactionService } from '@/lib/server/services/social';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WRITE } from '@/lib/server/env';

/**
 * Unified reaction endpoint (authenticated). Previously unauthenticated —
 * now requires a session (fixes auth bypass / like farming).
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    rateLimitByUser('reaction:set', sessionUserId, RATE_LIMIT_MAX_WRITE);
    const body = reactionSetSchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);
    const result = await reactionService.set(body.videoId, userId, body.type);
    if (result.status === 'created') {
      return NextResponse.json({ message: 'Reaction added' }, { status: 201 });
    }
    if (result.status === 'updated') {
      return NextResponse.json({ message: 'Reaction updated' });
    }
    return NextResponse.json({ message: 'Reaction already exists' });
  } catch (error) {
    return handleRouteError(error, 'POST /api/video/reaction');
  }
}
