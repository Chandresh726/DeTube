"use client";
import React from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ChannelInfo = ({ channel }) => {
    const router = useRouter();
    const goToChannel = () => {
        router.push(`/channel/${channel.id}`);
    }
    return (
        <div className="flex items-center">
            <Image
                src={channel.image}
                alt={`${channel.name} logo`}
                width={70}
                height={70}
                className="rounded-full hover:cursor-pointer"
                onClick={goToChannel}
            />
            <div className="ml-4">
                <h2 className="text-2xl font-bold hover:cursor-pointer" onClick={goToChannel}>{channel.name}</h2>
                <p className="text-gray-600">{channel.subscriberCount} subscribers</p>
            </div>
        </div>
    )
}

export default ChannelInfo