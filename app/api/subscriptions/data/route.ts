import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const userId = parseInt(id, 10);

        // Validate if user exists
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 404 });
        }

        const subscriptions = await prisma.subscription.findMany({
            where: {
                userId: userId,
            },
            include: {
                channel: true,
            },
        });

        const subscriptionData = subscriptions.map(sub => ({
            id: sub.channel.id,
            name: sub.channel.name,
            image: sub.channel.image
        }));

        return NextResponse.json({ subscriptions: subscriptionData }, { status: 200 });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}