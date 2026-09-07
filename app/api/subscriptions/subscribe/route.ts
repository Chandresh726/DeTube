import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { subscribeSchema } from '@/lib/server/validation';
import { subscriptionService } from '@/lib/server/services/social';
import { rateLimitByUser } from '@/lib/server/rate-limit';
import { RATE_LIMIT_MAX_WRITE } from '@/lib/server/env';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    rateLimitByUser('subscriptions:subscribe', sessionUserId, RATE_LIMIT_MAX_WRITE);
    const body = subscribeSchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);

    if (body.status === 'check') {
      const isSubscribed = await subscriptionService.isSubscribed(userId, body.channelId);
      return NextResponse.json({ isSubscribed });
    }
    if (body.status === 'sub') {
      const result = await subscriptionService.subscribe(userId, body.channelId);
      if (result.status === 'exists') {
        return NextResponse.json({ message: 'Subscription already exists' }, { status: 200 });
      }
      return NextResponse.json(result.subscription, { status: 201 });
    }
    await subscriptionService.unsubscribe(userId, body.channelId);
    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    return handleRouteError(error, 'POST /api/subscriptions/subscribe');
  }
}
