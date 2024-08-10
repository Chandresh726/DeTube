"use client";
import React, { useEffect, useState } from 'react';
import { getHomeVideoData } from '../util/fetch/video';
import VideoCard from './video/VideoCard';
import VideosLoading from './loading/VideosLoading';

const HomePage = () => {
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchVideos = async (page) => {
            try {
                const response = await getHomeVideoData(page, 6);
                const { videos, totalPages } = response;
                setVideos((prev) => [...prev, ...videos]);
                setHasMore(page < totalPages);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };
        fetchVideos(page);
    }, [page]);

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight && hasMore) {
            setPage((prev) => prev + 1);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [hasMore]);

    if (videos.length === 0) return <VideosLoading />

    return (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
                <VideoCard key={video.id} video={video} showChannel={true} />
            ))}
        </div>
    );
};

export default HomePage;