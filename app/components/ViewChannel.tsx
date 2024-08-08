import Image from 'next/image';
import React from 'react';
import VideoCard from './video/VideoCard';
import SubscribeButton from './button/SubscribeButton';

const ViewChannel = ({ channelData }) => {
    return (
        <div className="container mx-auto lg:px-16">
            <div className='flex flex-wrap sm:flex-nowrap items-stretch justify-center'>
                <div className='flex-shrink-0 p-4 w-1/2 md:w-1/3 lg:w-1/6'>
                    <Image
                        src={channelData?.image}
                        alt={`${channelData?.name} logo`}
                        width={100}
                        height={100}
                        className="rounded-full object-cover w-full h-full"
                    />
                </div>
                <div className='flex-grow px-4 md:p-4 flex flex-col justify-between'>
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4">{channelData?.name}</h1>
                        <p className="text-lg text-gray-600 mt-2">{channelData?.stats.subscriberCount} subscribers</p>
                        <div className='md:w-1/4 lg:w-1/5'>
                            <SubscribeButton channelId={channelData?.id} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <p className="line-clamp-2">{channelData?.description}</p>
            </div>

            <div className="divider my-1"></div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {channelData?.videos.map(video => (
                    <VideoCard key={video.id} video={video} showChannel={false} />
                ))}
            </div>
        </div>
    );
};

export default ViewChannel;