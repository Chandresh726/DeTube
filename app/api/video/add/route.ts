import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../util/prisma';

export async function POST(req: NextRequest) {
    try {
        const { channelId, videoId, title, description, thumbnail, video } = await req.json();
        console.log(videoId)
        // Validate the required fields
        if (!channelId || !videoId || !title || !thumbnail || !video) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Insert the new video into the database
        const newVideo = await prisma.video.create({
            data: {
                id: videoId,  // Use the videoId sent from the frontend
                title,
                description,
                thumbnailUrl: thumbnail,
                videoUrl: video,
                channelId,
            },
        });

        return NextResponse.json({ message: 'Video created successfully', videoId: newVideo.id }, { status: 200 });
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
