import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
    const { userId, videoId, type } = await req.json();

    if (!userId || !videoId || !type) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type !== 'LIKE' && type !== 'DISLIKE') {
        return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    try {
        // Validate userId and videoId
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        const video = await prisma.video.findUnique({ where: { id: videoId } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        // Check if the user has already reacted to the video
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                videoId_userId: {
                    videoId,
                    userId: Number(userId),
                },
            },
        });

        if (existingReaction) {
            if (existingReaction.type === type) {
                return NextResponse.json({ message: 'Reaction already exists' }, { status: 200 });
            }

            // Update the reaction if the type is different
            await prisma.reaction.update({
                where: {
                    videoId_userId: {
                        videoId,
                        userId: Number(userId),
                    },
                },
                data: {
                    type,
                },
            });

            return NextResponse.json({ message: 'Reaction updated' }, { status: 200 });
        }

        // Create a new reaction
        await prisma.reaction.create({
            data: {
                videoId,
                userId: Number(userId),
                type,
            },
        });

        return NextResponse.json({ message: 'Reaction added' }, { status: 201 });
    } catch (error) {
        console.error('Error handling reaction:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
