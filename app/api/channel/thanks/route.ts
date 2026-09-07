import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { thanksSchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const body = thanksSchema.parse(await req.json());
    const userId = assertOwnership(sessionUserId, body.userId);
    await walletService.thanks(userId, { channelId: body.channelId, amount: body.amount });
    return NextResponse.json({ success: true, message: 'Thank you transaction successful' });
  } catch (error) {
    return handleRouteError(error, 'POST /api/channel/thanks');
  }
}
