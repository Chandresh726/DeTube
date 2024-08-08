export const reactToVideo = async (userId: Number, videoId: String, status: String) => {
    const response = await fetch('/api/reaction/react', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, videoId, status }),
    });
    return await response.json();
};