export const getSubscriptionsData = async (id: number | string) => {
  const response = await fetch(`/api/subscriptions/data?id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch video data');
  }
  return await response.json();
};

export const getSubscriptionsDataWithVideos = async (id: number | string) => {
  const response = await fetch(`/api/subscriptions/data/video?id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch video data');
  }
  return await response.json();
};

export const addSubscription = async (userId: number | string, channelId: number, status: string) => {
  const response = await fetch('/api/subscriptions/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, channelId, status }),
  });
  return await response.json();
};

export const checkIfSubscribed = async (userId: number | string, channelId: number) => {
  const data = await addSubscription(userId, channelId, 'check');
  return data.isSubscribed;
};
