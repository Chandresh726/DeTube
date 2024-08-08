import React from 'react'
import VideoCardLoading from './VideoCardLoading'

const ViewChannelLoading = () => {
    return (
        <div className="container mx-auto lg:px-16">
            <div className='flex flex-wrap sm:flex-nowrap items-stretch justify-center'>
                <div className='flex-shrink-0 p-4 w-1/2 md:w-1/3 lg:w-1/6'>
                    <div className="skeleton h-full w-full rounded-full"></div>
                </div>
                <div className='flex-grow px-4 md:p-4 flex flex-col justify-between'>
                    <div>
                        <div className="mt-4 skeleton h-8 w-64"></div>
                        <div className="mt-2 skeleton h-8 w-64"></div>
                        <div className="mt-2 skeleton h-12 md:w-1/4 lg:w-1/5"></div>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full my-2"></div>
            </div>
            <div className="divider my-1"></div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <VideoCardLoading/>
                <VideoCardLoading/>
                <VideoCardLoading/>
            </div>
        </div>
    )
}

export default ViewChannelLoading