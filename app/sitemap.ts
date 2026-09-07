import { MetadataRoute } from 'next'
import prisma from '@/lib/server/db';
import { logError } from '@/lib/server/logger';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://detube.slope726.in'

    // Static routes
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/uploadVideo`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/subscription`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/statement`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/liked`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/deposit`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/withdraw`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }
    ]

    // Get video data
    const videos = await getAllVideos()
    const videoUrls = videos.map((video) => ({
        url: `${baseUrl}/video/${video.id}`,
        lastModified: new Date(video.updatedAt),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    // Get channel/user profile data
    const channels = await getAllChannels()
    const channelUrls = channels.map((channel) => ({
        url: `${baseUrl}/channel/${channel.id}`,
        lastModified: new Date(channel.updatedAt),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }))

    // Combine all routes
    return [
        ...staticRoutes,
        ...videoUrls,
        ...channelUrls
    ]
}

async function getAllVideos() {
    try {
        const videos = await prisma.video.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 1000 // Limit to recent 1000 videos for performance
        });
        return videos;
    } catch (error) {
        logError('sitemap', 'Error fetching videos for sitemap', error);
        return [];
    }
}

async function getAllChannels() {
    try {
        const channels = await prisma.channel.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
            take: 1000 // Limit to users with videos
        });
        return channels;
    } catch (error) {
        logError('sitemap', 'Error fetching channels for sitemap', error);
        return [];
    }
}
