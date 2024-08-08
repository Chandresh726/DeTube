import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
    const { userId, channelName, description, logo } = await req.json();

    if (!userId || !channelName || !description || !logo) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Check if user already has a channel
        const existingChannel = await prisma.channel.findUnique({
            where: {
                userId: Number(userId),
            },
        });

        if (existingChannel) {
            return NextResponse.json({ error: 'User already has a channel' }, { status: 400 });
        }

        // Create new channel
        const newChannel = await prisma.channel.create({
            data: {
                name: channelName,
                image: logo,
                description,
                userId: Number(userId)
            },
        });

        // Update the user's channelId
        await prisma.user.update({
            where: { id: Number(userId) },
            data: { channelId: newChannel.id },
        });

        return NextResponse.json({ channelId: newChannel.id }, { status: 200 });
    } catch (error) {
        console.error('Error creating channel:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
