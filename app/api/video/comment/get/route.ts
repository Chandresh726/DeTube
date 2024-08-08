import { NextRequest, NextResponse } from 'next/server';
import { timeSince } from '../../../util/util';
import prisma from '../../../util/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
        return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    try {
        // Validate if video exists
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });
        if (!video) {
            return NextResponse.json({ error: 'Invalid video ID' }, { status: 404 });
        }

        const comments = await prisma.comment.findMany({
            where: {
                videoId: videoId,
            },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const commentsData = comments.map(comment => ({
            name: comment.user.name,
            image: comment.user.image,
            content: comment.content,
            timeSince: timeSince(comment.createdAt)
        }));

        return NextResponse.json({ comments: commentsData }, { status: 200 });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}