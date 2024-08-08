import React from 'react'

const VideoCardLoading = () => {
    return (
        <div className="card card-compact bg-base-100 shadow-xl w-full transform transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
            <figure className="relative aspect-video">
                <div className="skeleton h-full w-full"></div>
            </figure>
            <div className="card-body p-4">
                <h2 className="card-title text-lg font-semibold overflow-hidden">
                    <div className="skeleton h-10 w-full"></div>
                </h2>
                <div className='flex justify-between'>
                    <div className="skeleton h-8 w-20"></div>
                    <div className="skeleton h-8 w-20"></div>
                </div>
            </div>
        </div>
    )
}

export default VideoCardLoading