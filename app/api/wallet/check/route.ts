import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';
import { authenticateUser } from '../../middleware/auth';

export async function POST(req: NextRequest) {
    const session = await authenticateUser(req);
    if (session instanceof NextResponse) {
        return session;
    }

    try {
        const { userId, publicKey } = await req.json();

        if (!userId || !publicKey) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Check if the wallet exists for the given user
        const existingWallet = await prisma.wallet.findFirst({
            where: {
                address: publicKey,
                userId: userId,
            },
        });

        if (existingWallet) {
            return NextResponse.json({ success: true, walletExists: true, wallet: existingWallet }, { status: 200 });
        } else {
            return NextResponse.json({ success: true, walletExists: false }, { status: 200 });
        }
    } catch (error) {
        console.error('Error checking wallet existence:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}