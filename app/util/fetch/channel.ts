export const createChannel = async (userId: Number, channelName: String, description: String, logo: String) => {
    const response = await fetch('/api/channel/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, channelName, description, logo }),
    });
    return await response.json();
}

export const getChannelData = async (id: Number) => {
    const response = await fetch(`/api/channel/data?id=${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch channel data');
    }
    return await response.json();
}