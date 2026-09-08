"use client";
import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import VideoCard from './video/VideoCard';
import { getSubscriptionsDataWithVideos } from '../util/fetch/subscription';
import VideosLoading from './loading/VideosLoading';
import { EmptyState } from '@/components/shared/empty-state';

const SubscriptionPage = ({ id }: { id: number }) => {
    const [videos, setVideos] = useState<Array<{ id: string; [k: string]: unknown }> | null>(null);

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        const fetchVideos = async () => {
            try {
                const response = await getSubscriptionsDataWithVideos(id);
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
                icon={Heart}
                title="No videos found"
                description="Videos from your subscriptions will show up here."
                actionLabel="Browse home"
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

export default SubscriptionPage
