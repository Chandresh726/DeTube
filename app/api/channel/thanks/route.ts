import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
    try {
        const { amount, userId, channelId } = await req.json();

        // Validate input
        if (amount <= 0 || !userId || !channelId) {
            return NextResponse.json({ success: false, message: 'Invalid parameters' }, { status: 400 });
        }

        // Convert amount to BigInt to avoid mixing with Number types
        const amountBigInt = BigInt(amount);

        // Fetch user and channel details from the database
        const [user, channel] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.channel.findUnique({ where: { id: channelId } }),
        ]);

        // Check if user and channel exist
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        if (!channel) {
            return NextResponse.json({ success: false, message: 'Channel not found' }, { status: 404 });
        }

        // Convert user's balance to BigInt for comparison
        const userBalanceBigInt = BigInt(user.balance);

        // Check if user has sufficient balance
        if (userBalanceBigInt < amountBigInt) {
            return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
        }

        // Get the channel owner's ID
        const channelOwnerId = channel.userId;

        // Update user and channel owner's balances and create a transaction log
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { balance: { decrement: amountBigInt } },
            }),
            prisma.user.update({
                where: { id: channelOwnerId },
                data: { balance: { increment: amountBigInt } },
            }),
            prisma.transaction.create({
                data: {
                    userId,
                    channelId,
                    amount,
                    type: 'THANKS',
                    status: 'SUCCESS'
                },
            }),
        ]);

        return NextResponse.json({ success: true, message: 'Thank you transaction successful' }, { status: 200 });
    } catch (error) {
        console.error('Thanks request failed', error);
        return NextResponse.json({ success: false, message: 'Thanks request failed', error: error.message }, { status: 500 });
    }
}