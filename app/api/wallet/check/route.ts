import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
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