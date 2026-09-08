'use client';
import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChannelInfo = ({
  channel,
}: {
  channel: { id: number; image?: string | null; name: string; subscriberCount?: number };
}) => {
  return (
    <div className="flex items-center gap-4">
      <Link
        href={`/channel/${channel.id}`}
        aria-label={`Go to ${channel.name}`}
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-[70px]">
          <AvatarImage src={channel.image ?? undefined} alt={`${channel.name} logo`} />
          <AvatarFallback>{channel.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div>
        <Link
          href={`/channel/${channel.id}`}
          className="rounded text-2xl font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {channel.name}
        </Link>
        <p className="text-sm text-muted-foreground">{channel.subscriberCount} subscribers</p>
      </div>
    </div>
  );
};

export default ChannelInfo;
