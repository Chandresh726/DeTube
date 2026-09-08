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
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        const prepareData = async () => {
            try {
                setError(null);
                const data = await getChannelData(Number(channelId));
                if (!cancelled) setChannelData(data)
            } catch {
                if (!cancelled) setError('Failed to load channel');
            }
        }
        prepareData()
        return () => { cancelled = true; };
    }, [channelId])


    if (error) {
        return (
            <div className="mx-auto max-w-xl py-16 text-center">
                <p className="text-lg font-semibold">Couldn&apos;t load channel</p>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <button className="mt-4 underline" onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }
    if (!channelData) {
        return <ViewChannelLoading />
    }

    return (
        <ViewChannel channelData={channelData} />
    );
};

export default ChannelPage;
