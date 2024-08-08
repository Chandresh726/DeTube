import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

export async function POST(req: NextRequest) {
    const { videoId, userId, content } = await req.json();

    if (!videoId || !userId || !content) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Validate if user exists
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 404 });
        }

        // Validate if video exists
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });
        if (!video) {
            return NextResponse.json({ error: 'Invalid video ID' }, { status: 404 });
        }

        // Create a new comment
        const newComment = await prisma.comment.create({
            data: {
                content,
                videoId,
                userId: Number(userId),
            },
        });

        return NextResponse.json(newComment, { status: 200 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}