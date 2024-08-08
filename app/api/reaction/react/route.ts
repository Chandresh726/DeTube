import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, videoId, status } = body;

        // Validate and convert userId
        const userIdNumber = parseInt(userId, 10);

        if (isNaN(userIdNumber)) {
            return NextResponse.json({ message: 'UserId must be a valid number' }, { status: 400 });
        }

        // Check if the user exists
        const user = await prisma.user.findUnique({ where: { id: userIdNumber } });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check if the video exists
        const video = await prisma.video.findUnique({ where: { id: videoId } });
        if (!video) {
            return NextResponse.json({ message: 'Video not found' }, { status: 404 });
        }

        // Check if the reaction already exists
        const existingReaction = await prisma.reaction.findFirst({
            where: {
                userId: userIdNumber,
                videoId: videoId,
            },
        });

        if (status === 'check') {
            if (existingReaction) {
                return NextResponse.json({ reactionType: existingReaction.type }, { status: 200 });
            } else {
                return NextResponse.json({ reactionType: null }, { status: 200 });
            }
        } else if (status === 'like' || status === 'dislike') {
            const reactionType = status === 'like' ? 'LIKE' : 'DISLIKE';

            if (existingReaction) {
                // Update the existing reaction
                const updatedReaction = await prisma.reaction.update({
                    where: { id: existingReaction.id },
                    data: { type: reactionType },
                });

                return NextResponse.json(updatedReaction, { status: 200 });
            } else {
                // Create a new reaction
                const newReaction = await prisma.reaction.create({
                    data: {
                        userId: userIdNumber,
                        videoId: videoId,
                        type: reactionType,
                    },
                });

                return NextResponse.json(newReaction, { status: 200 });
            }
        } else if (status === 'remove') {
            if (existingReaction) {
                // Remove the reaction
                await prisma.reaction.delete({
                    where: { id: existingReaction.id },
                });

                return NextResponse.json({ message: 'Reaction removed successfully' }, { status: 200 });
            } else {
                return NextResponse.json({ message: 'Reaction not found' }, { status: 404 });
            }
        } else {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}