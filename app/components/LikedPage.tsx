"use client";
import React, { useEffect, useState } from 'react'
import { ThumbsUp } from 'lucide-react';
import VideoCard from './video/VideoCard';
import VideosLoading from './loading/VideosLoading';
import { getLikedVideos } from '../util/fetch/liked';
import { EmptyState } from '@/components/shared/empty-state';

const LikedPage = ({ id }: { id: number }) => {
    const [videos, setVideos] = useState<Array<{ id: string; [k: string]: unknown }> | null>(null);

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        const fetchVideos = async () => {
            try {
                const response = await getLikedVideos(id);
                if (cancelled) return;
                const { videos } = response;
                setVideos(videos);
            } catch (error) {
                if (!cancelled) setVideos([]);
            }
        };
        fetchVideos();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [id]);

    if (!videos) return <VideosLoading />

    if (videos.length === 0) {
        return (
            <EmptyState
                icon={ThumbsUp}
                title="No liked videos"
                description="Videos you like will show up here."
                actionLabel="Discover videos"
                actionHref="/"
            />
        );
    }

    return (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
                <VideoCard key={video.id} video={video as never} showChannel={true} />
            ))}
        </div>
    );
}

export default LikedPage
