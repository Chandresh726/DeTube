import React from 'react'

const ViewVideoLoading = () => {
    return (
        <div className="container mx-auto px-1 lg:px-16">
            <div className="flex flex-col lg:flex-row">
                <div className="flex-grow lg:w-3/4">
                    <div className="relative aspect-video rounded-md overflow-hidden">
                        <div className="skeleton h-full w-full"></div>
                    </div>
                    <div className="mt-4">
                        <div className="skeleton h-8 w-full"></div>
                        <div className="flex justify-between my-4">
                            <div className="skeleton h-6 w-32"></div>
                            <div className="skeleton h-6 w-32"></div>
                        </div>
                        <div className='hidden md:block'>
                            <div className="skeleton h-12 w-full"></div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/4 lg:pl-8 mt-4 lg:mt-0">
                    <div className="flex items-center">
                        <div className="skeleton h-24 w-24 my-2 shrink-0 rounded-full"></div>
                        <div className="ml-4">
                            <div className="skeleton h-6 w-24 my-2"></div>
                            <div className="skeleton h-6 w-24 my-2"></div>
                        </div>
                    </div>
                    <div className="skeleton h-8 w-full rounded-3xl my-4"></div>
                    <div className="skeleton h-8 w-full rounded-3xl my-4"></div>
                    <div className="skeleton h-16 w-full rounded-3xl my-4"></div>
                </div>
            </div>
        </div>
    )
}

export default ViewVideoLoading