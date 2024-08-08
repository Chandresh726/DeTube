import { NextRequest, NextResponse } from 'next/server';
import { formatViews, timeSince } from '../../util/util';
import prisma from '../../util/prisma';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const offset = (page - 1) * limit;

    try {
        const videos = await prisma.video.findMany({
            skip: offset,
            take: limit,
            include: {
                channel: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const totalVideos = await prisma.video.count();

        const videoData = videos.map(video => ({
            id: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            views: formatViews(video.views),
            timeSince: timeSince(video.createdAt),
            channel: {
                name: video.channel.name,
                image: video.channel.image,
            },
        }));

        return NextResponse.json({
            videos: videoData,
            totalVideos,
            currentPage: page,
            totalPages: Math.ceil(totalVideos / limit),
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}