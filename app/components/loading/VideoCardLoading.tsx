import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const VideoCardLoading = () => {
  return (
    <Card className="w-full overflow-hidden py-0">
      <div className="relative aspect-video">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <CardContent className="flex flex-col gap-3 p-4">
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
