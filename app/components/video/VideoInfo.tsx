'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const VideoInfo = ({
  data,
}: {
  data: { title: string; views: number; timeSince: string; description: string };
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded((v) => !v);
  };

  return (
    <div className="mt-4">
      <h1 className="text-xl font-bold md:text-3xl">{data.title}</h1>
      <div className="my-4 flex justify-between gap-2">
        <p className="text-sm text-muted-foreground">{data.views} Views</p>
        <p className="text-sm text-muted-foreground">{data.timeSince}</p>
      </div>
      <div>
        <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
          {data.description}
        </p>
        <Button
          onClick={toggleDescription}
          variant="link"
          className="mt-2 h-auto p-0"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
