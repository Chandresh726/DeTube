"use client";
import { use, useEffect, useState } from 'react';
import ViewChannel from '../../components/ViewChannel';
import { getChannelData } from '../../util/fetch/channel';
import ViewChannelLoading from '../../components/loading/ViewChannelLoading';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const ChannelPage = ({ params }: PageProps) => {
    const { id: channelId } = use(params);
    const [channelData, setChannelData] = useState(null);
    useEffect(() => {
        const prepareData = async () => {
            const data = await getChannelData(Number(channelId));
            setChannelData(data)
        }
        prepareData()
    }, [])


    if (!channelData) {
        return <ViewChannelLoading />
    }

    return (
        <ViewChannel channelData={channelData} />
    );
};

export default ChannelPage;
