"use client";
import ViewVideo from '../../components/video/ViewVideo';
import { use, useEffect, useState } from 'react';
import { getVideoData } from '../../util/fetch/video';
import ViewVideoLoading from '../../components/loading/ViewVideoLoading';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const VideoPage = ({ params }: PageProps) => {
    const { id: videoId } = use(params);
    const [videoData, setVideoData] = useState(null)
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const prepareData = async () => {
            try {
                setError(null);
                const data = await getVideoData(videoId);
                if (!cancelled) setVideoData(data)
            } catch {
                if (!cancelled) setError('Failed to load video');
            }
        }
        prepareData()
        return () => { cancelled = true; };
    }, [videoId])

    if (error) {
        return (
            <div className="mx-auto max-w-xl py-16 text-center">
                <p className="text-lg font-semibold">Couldn&apos;t load video</p>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <button className="mt-4 underline" onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }
    if (!videoData) {
        return <ViewVideoLoading />
    }

    return (
        <ViewVideo videoData={videoData} />
    );
};

export default VideoPage;
