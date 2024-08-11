import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
            select: {
                balance: true,
                lockedBalance: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userBalance = {
            balance: user.balance,
            lockedBalance: user.lockedBalance,
        };

        return NextResponse.json(userBalance, { status: 200 });
    } catch (error) {
        console.error('Error fetching user balance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}