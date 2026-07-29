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

    useEffect(() => {
        const prepareData = async () => {
            const data = await getVideoData(videoId);
            setVideoData(data)
        }
        prepareData()
    }, [videoId])

    if (!videoData) {
        return <ViewVideoLoading />
    }

    return (
        <ViewVideo videoData={videoData} />
    );
};

export default VideoPage;
