import { NextRequest, NextResponse } from 'next/server';
import { formatViews, timeSince } from '../../util/util';
import prisma from '../../util/prisma';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const channelId = url.searchParams.get('id');

    if (!channelId) {
        return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: Number(channelId),
            },
            include: {
                videos: true,
            },
        });

        if (!channel) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }

        const subscriberCount = await prisma.subscription.count({
            where: {
                channelId: Number(channelId),
            },
        });

        const sortedVideos = channel.videos
            .map(video => ({
                id: video.id,
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl,
                videoUrl: video.videoUrl,
                views: formatViews(video.views),
                timeSince: timeSince(video.createdAt),
                createdAt: new Date(video.createdAt)
            }))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by createdAt in descending order

        const channelWithStats = {
            id: channel.id,
            name: channel.name,
            image: channel.image,
            description: channel.description,
            stats: {
                subscriberCount,
            },
            videos: sortedVideos.map(({ createdAt, ...rest }) => rest), // Remove createdAt from the final response
        };

        return NextResponse.json(channelWithStats, { status: 200 });
    } catch (error) {
        console.error('Error fetching channel:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}