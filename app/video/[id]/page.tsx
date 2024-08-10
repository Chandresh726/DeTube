"use client";
import ViewVideo from '../../components/video/ViewVideo';
import { useEffect, useState } from 'react';
import { getVideoData } from '../../util/fetch/video';
import ViewVideoLoading from '../../components/loading/ViewVideoLoading';

interface PageProps {
    params: {
        id: string;
    };
}

const VideoPage = ({ params }: PageProps) => {
    const videoId = params.id;
    const [videoData, setVideoData] = useState(null)

    useEffect(() => {
        const prepareData = async () => {
            const data = await getVideoData(videoId);
            setVideoData(data)
        }
        prepareData()
    }, [])

    if (!videoData) {
        return <ViewVideoLoading />
    }

    return (
        <ViewVideo videoData={videoData} />
    );
};

export default VideoPage;