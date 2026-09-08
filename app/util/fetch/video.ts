export const createVideo = async (
  channelId: number,
  videoId: string,
  title: string,
  description: string,
  thumbnail: string,
  video: string,
) => {
  const response = await fetch('/api/video/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channelId, videoId, title, description, thumbnail, video }),
  });
  return await response.json();
};

export const getVideoData = async (id: string) => {
  const response = await fetch(`/api/video/data?id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch video data');
  }
  return await response.json();
};

export const getHomeVideoData = async (page: number, limit: number) => {
  const response = await fetch(`/api/video/home?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch video data');
  }
  const data = await response.json();
  return data;
};
