import React from 'react'

const ProgressBar = ({ progress, flag }: { progress: number, flag: boolean }) => {
    return (
        <div className={`my-4 ${flag ? 'visible' : 'invisible'}`}>
            <div className='text-sm text-gray-400'>
                {progress===100 ? 'Uploaded' : 'Uploading ...'}
            </div>
            <progress className="progress progress-success w-full" value={progress.toString()} max="100"></progress>
        </div>
    )
}

export default ProgressBar