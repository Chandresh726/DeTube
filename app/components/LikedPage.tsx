"use client";
import React, { useEffect, useState } from 'react'
import VideoCard from './video/VideoCard';
import VideosLoading from './loading/VideosLoading';
import { getLikedVideos } from '../util/fetch/liked';

const LikedPage = ({ id }) => {
    const [videos, setVideos] = useState(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await getLikedVideos(id);
                const { videos } = response;
                setVideos(videos);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };
        fetchVideos();
    }, []);

    if (!videos) return <VideosLoading />

    if (videos.length === 0) return <div className='m-4'>No Liked Videos Found</div>

    return (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
                <VideoCard key={video.id} video={video} showChannel={true} />
            ))}
        </div>
    );
}

export default LikedPage