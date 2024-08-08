export const addComment = async (userId: Number, videoId: String, content: String) => {
    const response = await fetch('/api/video/comment/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, videoId, content }),
    });
    return await response.json();
}

export const getComments = async (videoId: String) => {
    const response = await fetch(`/api/video/comment/get?id=${videoId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch video comments');
    }
    return await response.json();
}