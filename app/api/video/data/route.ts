import { NextRequest, NextResponse } from 'next/server';
import { formatViews, timeSince } from '../../util/util';
import prisma from '../../util/prisma';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('id');

    if (!videoId) {
        return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    try {
        const video = await prisma.video.update({
            where: { id: videoId },
            data: { views: { increment: 1 } },
            include: {
                channel: true,
            },
        });

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        const likeCount = await prisma.reaction.count({
            where: {
                videoId: videoId,
                type: 'LIKE',
            },
        });

        const dislikeCount = await prisma.reaction.count({
            where: {
                videoId: videoId,
                type: 'DISLIKE',
            },
        });

        const subscriberCount = await prisma.subscription.count({
            where: {
                channelId: video.channelId,
            },
        });

        // Fetch supporters who have sent SOL with transaction type 'THANKS'
        const supporters = await prisma.transaction.findMany({
            where: {
                channelId: video.channelId,
                type: 'THANKS',
                status: 'SUCCESS',
            },
            include: {
                user: true,
            },
        });

        // Aggregate total amount sent by each supporter
        const supportersWithAmounts = supporters.reduce((acc, transaction) => {
            const existing = acc.find(s => s.user.id === transaction.userId);
            if (existing) {
                existing.amount += transaction.amount;
            } else {
                acc.push({
                    user: transaction.user,
                    amount: transaction.amount,
                });
            }
            return acc;
        }, []);

        const topSupporters = supportersWithAmounts
            .sort((a, b) => {
                // Convert BigInt to string for comparison
                const amountA = Number(a.amount);
                const amountB = Number(b.amount);
                return amountB - amountA // Sort in descending order
            })
            .slice(0, 5);

        const videoWithStats = {
            id: video.id,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            videoUrl: video.videoUrl,
            views: formatViews(video.views),
            timeSince: timeSince(video.createdAt),
            channel: {
                id: video.channel.id,
                name: video.channel.name,
                image: video.channel.image,
                subscriberCount: subscriberCount,
            },
            stats: {
                likeCount,
                dislikeCount,
            },
            supporters: topSupporters.map(supporter => ({
                id: supporter.user.id,
                name: supporter.user.name,
                image: supporter.user.image,
                amount: supporter.amount.toString(), // Convert BigInt to string
            })),
        };

        return NextResponse.json(videoWithStats, { status: 200 });
    } catch (error) {
        console.error('Error fetching video:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}