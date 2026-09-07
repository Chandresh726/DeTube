import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ViewVideoLoading = () => {
  return (
    <div className="container mx-auto px-1 lg:px-16" aria-busy="true" aria-label="Loading video">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="grow lg:w-3/4">
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Skeleton className="h-7 w-full" />
            <div className="flex justify-between gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:mt-0 lg:w-1/4 lg:pl-8">
          <div className="flex items-center gap-4">
            <Skeleton className="my-2 size-24 shrink-0 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default ViewVideoLoading;
