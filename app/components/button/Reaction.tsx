'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';
import { toast } from 'sonner';
import { reactToVideo } from '../../util/fetch/reaction';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Reaction = ({
  stats,
  videoId,
}: {
  stats: { likeCount: number; dislikeCount: number };
  videoId: string;
}) => {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(stats.likeCount);
  const [dislikes, setDislikes] = useState(stats.dislikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const userId = session?.user?.id;
  const router = useRouter();

  useEffect(() => {
    setLikes(stats.likeCount);
    setDislikes(stats.dislikeCount);
  }, [stats.likeCount, stats.dislikeCount]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const fetchInitialReaction = async () => {
      try {
        const response = await reactToVideo(userId, videoId, 'check');
        if (cancelled) return;
        if (response.reactionType === 'LIKE') {
          setIsLiked(true);
        } else if (response.reactionType === 'DISLIKE') {
          setIsDisliked(true);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load reaction');
      }
    };
    fetchInitialReaction();
    return () => {
      cancelled = true;
    };
  }, [userId, videoId]);

  const handleLike = async () => {
    if (!userId) {
      router.push('/logIn');
      return;
    }

    let status: 'like' | 'remove';
    if (isLiked) {
      setLikes((v) => v - 1);
      status = 'remove';
      setIsLiked(false);
    } else {
      setLikes((v) => v + 1);
      if (isDisliked) {
        setDislikes((v) => v - 1);
        setIsDisliked(false);
      }
      status = 'like';
      setIsLiked(true);
    }
    try {
      await reactToVideo(userId, videoId, status);
    } catch {
      toast.error('Reaction failed');
    }
  };

  const handleDislike = async () => {
    if (!userId) {
      router.push('/logIn');
      return;
    }

    let status: 'dislike' | 'remove';
    if (isDisliked) {
      setDislikes((v) => v - 1);
      status = 'remove';
      setIsDisliked(false);
    } else {
      setDislikes((v) => v + 1);
      if (isLiked) {
        setLikes((v) => v - 1);
        setIsLiked(false);
      }
      status = 'dislike';
      setIsDisliked(true);
    }
    try {
      await reactToVideo(userId, videoId, status);
    } catch {
      toast.error('Reaction failed');
    }
  };

  return (
    <div className="my-4 flex w-full items-center gap-2 rounded-xl border bg-muted p-2">
      <Button
        variant={isLiked ? 'secondary' : 'ghost'}
        className="flex-1 flex-col gap-1 data-[active=true]:text-green-600"
        data-active={isLiked}
        onClick={handleLike}
        aria-pressed={isLiked}
        aria-label={`Like video, ${likes} likes`}
      >
        <AiOutlineLike size={22} aria-hidden data-icon="inline-start" />
        <span className="text-xs">{likes} Likes</span>
      </Button>
      <Separator orientation="vertical" className="h-10" />
      <Button
        variant={isDisliked ? 'secondary' : 'ghost'}
        className="flex-1 flex-col gap-1 data-[active=true]:text-red-600"
        data-active={isDisliked}
        onClick={handleDislike}
        aria-pressed={isDisliked}
        aria-label={`Dislike video, ${dislikes} dislikes`}
      >
        <AiOutlineDislike size={22} aria-hidden data-icon="inline-start" />
        <span className="text-xs">{dislikes} Dislikes</span>
      </Button>
    </div>
  );
};

export default Reaction;
