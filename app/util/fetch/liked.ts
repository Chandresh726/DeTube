export const getLikedVideos = async (id: number | string) => {
  const response = await fetch(`/api/video/liked?id=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch video data');
  }
  return await response.json();
};
