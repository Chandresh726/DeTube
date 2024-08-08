import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

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

        // Fetch videos from channels the user is subscribed to, in descending order by creation date
        const videos = await prisma.video.findMany({
            where: {
                channel: {
                    subscriptions: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                channel: true,
            },
        });

        const videoData = videos.map(video => ({
            id: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            createdAt: video.createdAt,
            views: video.views,
            channel: {
                id: video.channel.id,
                name: video.channel.name,
                image: video.channel.image,
            },
        }));

        return NextResponse.json({ videos: videoData }, { status: 200 });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}