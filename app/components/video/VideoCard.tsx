'use client';
import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type VideoCardProps = {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
    timeSince?: string;
    views?: number;
    channel?: { image?: string | null; name?: string };
  };
  showChannel?: boolean;
};

const VideoCard = memo(function VideoCard({ video, showChannel }: VideoCardProps) {
  return (
    <Link
      href={`/video/${video.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Watch ${video.title}`}
    >
      <Card className="w-full gap-0 overflow-hidden py-0 transition-shadow duration-200 group-hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <CardContent className="flex flex-col gap-2 px-4 pb-4 pt-3">
          <h2 className="truncate text-base font-semibold" title={video.title}>
            {video.title}
          </h2>
          <div className="flex items-center justify-between gap-2">
            {showChannel && video.channel ? (
              <div className="mr-2 flex min-w-0 items-center">
                <Avatar className="mr-2 size-8">
                  <AvatarImage
                    src={video.channel.image ?? undefined}
                    alt={`${video.channel.name ?? 'Channel'} logo`}
                  />
                  <AvatarFallback>{(video.channel.name ?? 'C').slice(0, 1)}</AvatarFallback>
                </Avatar>
                <p className="truncate text-sm font-semibold text-muted-foreground">{video.channel.name}</p>
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">{video.timeSince}</p>
            <span className="text-xs text-muted-foreground">{video.views} Views</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

export default VideoCard;
