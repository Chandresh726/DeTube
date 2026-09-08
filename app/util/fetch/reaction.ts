export const reactToVideo = async (userId: number | string, videoId: string, status: string) => {
  const response = await fetch('/api/reaction/react', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, videoId, status }),
  });
  return await response.json();
};
