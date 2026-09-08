import React from 'react';
import VideoCardLoading from './VideoCardLoading';

const VideosLoading = () => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <VideoCardLoading />
      <VideoCardLoading />
      <VideoCardLoading />
      <VideoCardLoading />
      <VideoCardLoading />
      <VideoCardLoading />
    </div>
  );
};

export default VideosLoading;
