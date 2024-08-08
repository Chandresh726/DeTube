"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const VideoCard = ({ video , showChannel }) => {
    const router = useRouter();
    const handleClick = () => {
        router.push(`/video/${video.id}`); // Use router.push for client-side navigation
    };
    return (
        <div
            className="card card-compact bg-base-100 shadow-xl w-full transform transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
            onClick={handleClick}
        >
            <figure className="relative aspect-video">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="object-cover w-full"
                />
            </figure>
            <div className="card-body p-4">
                <h2 className={`card-title text-lg font-semibold overflow-hidden`}>
                    <span className="line-clamp-1" title={video.title}>{video.title}</span>
                </h2>
                <div className='flex justify-between items-center'>
                    {showChannel &&
                        <div className='mr-2 flex items-center'>
                            <img
                                src={video.channel.image}
                                alt={`${video.channel.name} logo`}
                                className="rounded-full w-8 h-8 mr-2"
                            />
                            <p className="text-md font-bold text-gray-500">{video.channel.name}</p>
                        </div>
                    }
                    <p className="text-sm text-gray-500">{video.timeSince}</p>
                    <span className="text-sm text-gray-500">{video.views} Views</span>
                </div>
            </div>
        </div>
    );
}

export default VideoCard;