import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, channelId, status } = body;

        // Validate and convert userId and channelId
        const userIdNumber = parseInt(userId, 10);
        const channelIdNumber = parseInt(channelId, 10);

        if (isNaN(userIdNumber) || isNaN(channelIdNumber)) {
            return NextResponse.json({ message: 'UserId and ChannelId must be valid numbers' }, { status: 400 });
        }

        // Check if the user exists
        const user = await prisma.user.findUnique({ where: { id: userIdNumber } });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check if the channel exists
        const channel = await prisma.channel.findUnique({ where: { id: channelIdNumber } });
        if (!channel) {
            return NextResponse.json({ message: 'Channel not found' }, { status: 404 });
        }

        // Check if the subscription already exists
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId: userIdNumber,
                channelId: channelIdNumber,
            },
        });

        if (status === 'check') {
            return NextResponse.json({ isSubscribed: !!existingSubscription }, { status: 200 });
        } else if (status === 'sub') {
            if (existingSubscription) {
                return NextResponse.json({ message: 'Subscription already exists' }, { status: 201 });
            }

            // Add the subscription
            const newSubscription = await prisma.subscription.create({
                data: {
                    userId: userIdNumber,
                    channelId: channelIdNumber,
                },
            });

            return NextResponse.json(newSubscription, { status: 200 });
        } else if (status === 'unsub') {
            if (!existingSubscription) {
                return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
            }

            // Remove the subscription
            await prisma.subscription.delete({
                where: { id: existingSubscription.id },
            });

            return NextResponse.json({ message: 'Unsubscribed successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}