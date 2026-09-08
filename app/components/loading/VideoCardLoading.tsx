import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const VideoCardLoading = () => {
  return (
    <Card className="w-full gap-0 overflow-hidden py-0">
      <div className="relative aspect-video">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
      <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-3">
        <Skeleton className="h-5 w-full" />
        <div className="flex justify-between gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCardLoading;
