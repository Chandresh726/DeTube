import { NextRequest, NextResponse } from 'next/server';
import { requireSession, assertOwnership } from '@/lib/server/auth';
import { handleRouteError } from '@/lib/server/http';
import { depositSchema } from '@/lib/server/validation';
import { walletService } from '@/lib/server/services/wallet';

export async function POST(req: NextRequest) {
  try {
    const { userId: sessionUserId } = await requireSession();
    const body = depositSchema.parse(await req.json());
    // Wallet ownership is verified inside the service (address must belong to session user).
    const wallet = await (await import('@/app/api/util/prisma')).default.wallet.findUnique({
      where: { address: body.address },
    });
    if (!wallet || wallet.userId !== sessionUserId) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }
    const result = await walletService.deposit(sessionUserId, {
      address: body.address,
      amount: body.amount as bigint,
      signature: body.signature,
    });
    return NextResponse.json({ success: result.status === 'SUCCESS', status: result.status });
  } catch (error) {
    return handleRouteError(error, 'POST /api/wallet/deposit');
  }
}
