"use client";
import Image from 'next/image';
import React from 'react';
import VideoCard from './video/VideoCard';
import SubscribeButton from './button/SubscribeButton';
import ThanksButton from './button/ThanksBtn';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/empty-state';
import { Clapperboard } from 'lucide-react';

const ViewChannel = ({ channelData }: { channelData: {
  id: number;
  name: string;
  image?: string | null;
  description?: string;
  stats: { subscriberCount: number };
  videos: Array<{ id: string; [k: string]: unknown }>;
} }) => {
    return (
        <div className="container mx-auto lg:px-16">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:justify-start">
                <div className="shrink-0 p-4">
                    <div className="relative size-28 overflow-hidden rounded-full md:size-36">
                        <Image
                            src={channelData?.image ?? '/default-channel.png'}
                            alt={`${channelData?.name} logo`}
                            fill
                            sizes="(max-width: 768px) 112px, 144px"
                            className="object-cover"
                        />
                    </div>
                </div>
                <div className="flex grow flex-col justify-center gap-2 px-4 md:p-4">
                    <h1 className="mt-4 text-3xl font-bold md:text-4xl lg:text-5xl">{channelData?.name}</h1>
                    <p className="text-lg text-muted-foreground">{channelData?.stats.subscriberCount} subscribers</p>
                    <div className="flex max-w-md gap-2">
                        <div className="w-full"><SubscribeButton channelId={channelData?.id} /></div>
                        <div className="w-full"><ThanksButton channelId={channelData?.id} channelName={channelData?.name} /></div>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <p className="line-clamp-2">{channelData?.description}</p>
            </div>

            <Separator className="my-2" />
            {channelData?.videos.length === 0 ? (
              <EmptyState icon={Clapperboard} title="No videos yet" description="This channel hasn't uploaded anything." />
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {channelData?.videos.map(video => (
                      <VideoCard key={video.id} video={video as never} showChannel={false} />
                  ))}
              </div>
            )}
        </div>
    );
};

export default ViewChannel;
