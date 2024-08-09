"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';
import { reactToVideo } from '../../util/fetch/reaction';
import { useTheme } from '../ThemeContext';

const Reaction = ({ stats, videoId }) => {
    const { theme } = useTheme();
    const { data: session } = useSession();
    const [likes, setLikes] = useState(stats.likeCount);
    const [dislikes, setDislikes] = useState(stats.dislikeCount);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const userId = session?.user?.id;

    // Fetch initial reaction status
    useEffect(() => {
        if (userId) {
            const fetchInitialReaction = async () => {
                const response = await reactToVideo(userId, videoId, 'check');
                if (response.reactionType === 'LIKE') {
                    setIsLiked(true);
                } else if (response.reactionType === 'DISLIKE') {
                    setIsDisliked(true);
                }
            };
            fetchInitialReaction();
        }
    }, [userId, videoId]);

    const handleLike = async () => {
        if (!userId) return;

        let status;
        if (isLiked) {
            setLikes(likes - 1);
            status = 'remove';
            setIsLiked(false);
        } else {
            setLikes(likes + 1);
            if (isDisliked) {
                setDislikes(dislikes - 1);
                setIsDisliked(false);
            }
            status = 'like';
            setIsLiked(true);
        }
        await reactToVideo(userId, videoId, status);
    };

    const handleDislike = async () => {
        if (!userId) return;

        let status;
        if (isDisliked) {
            setDislikes(dislikes - 1);
            status = 'remove';
            setIsDisliked(false);
        } else {
            setDislikes(dislikes + 1);
            if (isLiked) {
                setLikes(likes - 1);
                setIsLiked(false);
            }
            status = 'dislike';
            setIsDisliked(true);
        }
        await reactToVideo(userId, videoId, status);
    };

    return (
        <div className={`my-4 w-full p-2 rounded-3xl flex items-center space-x-4 ${theme==='dark'?'bg-gray-800':'bg-gray-500'}`}>
            <div
                className={`flex flex-col items-center justify-center w-1/2 cursor-pointer ${isLiked ? 'text-green-500' : 'text-white'} hover:text-green-500 ${!userId && 'cursor-not-allowed'}`}
                onClick={userId ? handleLike : null}
            >
                <AiOutlineLike size={28} className={`${isLiked ? 'text-green-500' : ''}`} />
                <span className="mt-1 text-xs">{likes} Likes</span>
            </div>
            <div className="divider divider-horizontal"></div>
            <div
                className={`flex flex-col items-center justify-center w-1/2 cursor-pointer ${isDisliked ? 'text-red-500' : 'text-white'} hover:text-red-500 ${!userId && 'cursor-not-allowed'}`}
                onClick={userId ? handleDislike : null}
            >
                <AiOutlineDislike size={28} className={`${isDisliked ? 'text-red-500' : ''}`} />
                <span className="mt-1 text-xs">{dislikes} Dislikes</span>
            </div>
        </div>
    );
};

export default Reaction;