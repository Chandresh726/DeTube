import React from 'react'
import VideoCardLoading from './VideoCardLoading'

const VideosLoading = () => {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <VideoCardLoading/>
        <VideoCardLoading/>
        <VideoCardLoading/>
        <VideoCardLoading/>
        <VideoCardLoading/>
        <VideoCardLoading/>
    </div>
  )
}

export default VideosLoading