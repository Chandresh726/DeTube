import React from 'react'
import { Progress } from '@/components/ui/progress';

const ProgressBar = ({ progress, flag }: { progress: number, flag: boolean }) => {
    return (
        <div className={`my-4 ${flag ? 'visible' : 'invisible'}`} aria-live="polite">
            <div className="text-sm text-muted-foreground">
                {progress === 100 ? 'Uploaded' : 'Uploading…'}
            </div>
            <Progress value={progress} className="w-full" />
        </div>
    )
}

export default ProgressBar
