export const createChannel = async (userId: number, channelName: string, description: string, logo: string) => {
    const response = await fetch('/api/channel/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, channelName, description, logo }),
    });
    return await response.json();
}

export const getChannelData = async (id: number) => {
    const response = await fetch(`/api/channel/data?id=${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch channel data');
    }
    return await response.json();
}

export const sendThanks = async (amount: number, userId: number, channelId: number) => {
    const response = await fetch('/api/channel/thanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channelId,
            userId,
            amount
        }),
    });
    if (!response.ok) {
        throw new Error('Failed');
    }
    return await response.json();
}