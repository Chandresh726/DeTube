export const getSubscriptionsData = async (id: Number) => {
    const response = await fetch(`/api/subscriptions/data?id=${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch video data');
    }
    return await response.json();
};

export const getSubscriptionsDataWithVideos = async (id: Number) => {
    const response = await fetch(`/api/subscriptions/data/video?id=${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch video data');
    }
    return await response.json();
};

export const addSubscription = async (userId: Number, channelId: Number, status: String) => {
    const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, channelId, status }),
    });
    return await response.json();
};

export const checkIfSubscribed = async (userId: Number, channelId: Number) => {
    const data = await addSubscription(userId, channelId, 'check');
    return data.isSubscribed;
};