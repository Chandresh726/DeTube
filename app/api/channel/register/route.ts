import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { channelRegisterSchema } from '@/lib/server/validation';
import { channelService } from '@/lib/server/services/channels';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const body = channelRegisterSchema.parse(await req.json());
    const ownerUserId = assertOwnership(sessionUserId, body.userId);
    const channel = await channelService.register(ownerUserId, body);
    return NextResponse.json({ channelId: channel.id }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'POST /api/channel/register');
  }
}
