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

        // Fetch videos liked by the user, ordered by when the user liked the video (reaction createdAt) in descending order
        const likedVideos = await prisma.reaction.findMany({
            where: {
                userId: userId,
                type: 'LIKE',
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                video: {
                    include: {
                        channel: true,
                    },
                },
            },
        });

        const videoData = likedVideos.map(reaction => ({
            id: reaction.video.id,
            title: reaction.video.title,
            description: reaction.video.description,
            thumbnailUrl: reaction.video.thumbnailUrl,
            videoUrl: reaction.video.videoUrl,
            views: reaction.video.views,
            likedAt: reaction.createdAt,  // When the user liked the video
            channel: {
                id: reaction.video.channel.id,
                name: reaction.video.channel.name,
                image: reaction.video.channel.image,
            },
        }));

        return NextResponse.json({ videos: videoData }, { status: 200 });
    } catch (error) {
        console.error('Error fetching liked videos:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}