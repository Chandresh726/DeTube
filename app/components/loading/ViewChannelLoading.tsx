import React from 'react';
import VideoCardLoading from './VideoCardLoading';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const ViewChannelLoading = () => {
  return (
    <div className="container mx-auto lg:px-16" aria-busy="true" aria-label="Loading channel">
      <div className="flex flex-wrap items-stretch justify-center sm:flex-nowrap">
        <div className="w-1/2 shrink-0 p-4 md:w-1/3 lg:w-1/6">
          <Skeleton className="h-32 w-full rounded-full md:h-full" />
        </div>
        <div className="flex grow flex-col justify-between px-4 md:p-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="my-4 h-10 w-64" />
            <Skeleton className="h-4 w-64" />
            <div className="md:w-1/2 lg:w-1/3">
              <div className="flex gap-2">
                <Skeleton className="m-2 h-9 w-1/2 md:w-64" />
                <Skeleton className="m-2 h-9 w-1/2 md:w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="my-2 h-4 w-full" />
      </div>
      <Separator className="my-1" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <VideoCardLoading />
        <VideoCardLoading />
        <VideoCardLoading />
      </div>
    </div>
  );
};

export default ViewChannelLoading;
