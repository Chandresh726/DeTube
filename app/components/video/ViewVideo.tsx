'use client';
import React from 'react';
import Reaction from '../button/Reaction';
import SubscribeButton from '../button/SubscribeButton';
import VideoInfo from './VideoInfo';
import CommentSection from './comment/CommentSection';
import ChannelInfo from './ChannelInfo';
import ThanksButton from '../button/ThanksBtn';
import Supporters from './Supporters';
import { Separator } from '@/components/ui/separator';

const ViewVideo = ({
  videoData,
}: {
  videoData: {
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
    views: number;
    timeSince: string;
    description: string;
    channel: { id: number; name: string; image?: string | null; subscriberCount?: number };
    stats: { likeCount: number; dislikeCount: number };
    supporters: Array<{ id: number | string; name: string; image?: string | null; amount: number | string }>;
  };
}) => {
  return (
    <div className="container mx-auto px-1 lg:px-16">
      <div className="flex flex-col lg:flex-row">
        <div className="min-w-0 grow lg:flex-[3]">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            <video
              controls
              playsInline
              preload="metadata"
              src={videoData.videoUrl}
              poster={videoData.thumbnailUrl}
              className="h-full w-full"
            />
          </div>
          <VideoInfo data={videoData} />
        </div>
        <div className="mt-4 flex min-w-0 flex-col gap-3 lg:mt-0 lg:flex-[1] lg:pl-8">
          <ChannelInfo channel={videoData.channel} />
          <SubscribeButton channelId={videoData.channel.id} />
          <ThanksButton channelId={videoData.channel.id} channelName={videoData.channel.name} />
          <Reaction stats={videoData.stats} videoId={videoData.id} />
          <Supporters supporters={videoData.supporters} />
        </div>
      </div>
      <Separator className="my-4" />
      <CommentSection videoId={videoData.id} />
    </div>
  );
};

export default ViewVideo;
