"use client";
import React, { useState } from 'react'

const VideoInfo = ({ data }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleDescription = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="mt-4">
            <h1 className="text-xl md:text-3xl font-bold">{data.title}</h1>
            <div className="flex justify-between my-4">
                <p className="text-sm text-gray-400">{data.views} Views</p>
                <p className="text-sm text-gray-400">{data.timeSince}</p>
            </div>
            <div className='hidden md:block'>
                <p className={`text-gray-400 ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {data.description}
                </p>
                <button
                    onClick={toggleDescription}
                    className="text-blue-500 mt-2"
                >
                    {isExpanded ? 'Show less' : 'Read more'}
                </button>
            </div>
        </div>
    )
}

export default VideoInfo