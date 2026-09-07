"use client";
import React, { useEffect, useState } from 'react'
import AddComment from './AddComment';
import { getComments } from '../../../util/fetch/comment';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

const CommentSection = ({ videoId }: { videoId: string }) => {
    const [comments, setComments] = useState<Array<{ image?: string | null; name: string; timeSince: string; content: string }> | null>(null);
    const [flag, setFlag] = useState(false);

    const triggerUpdate = () => {
        setFlag((f) => !f)
    }

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        const updateComments = async () => {
            const data = await getComments(videoId);
            if (cancelled) return;
            if (data) {
                setComments(data.comments);
            }
        }
        updateComments()
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [flag, videoId])

    return (
        <div>
            <h3 className="text-2xl font-bold">Comments</h3>
            <AddComment videoId={videoId} triggerUpdate={triggerUpdate} />
            <div>
                {!comments ? (
                    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading comments">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
                ) : (
                    comments.map((comment, index) => (
                        <div key={`${comment.name}-${index}`} className="my-4 flex items-start">
                            <Avatar className="mr-4 size-10">
                                <AvatarImage src={comment.image || DEFAULT_AVATAR} alt={comment.name} />
                                <AvatarFallback>{comment.name.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="grow">
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold">{comment.name}</span>
                                    <span className="text-xs text-muted-foreground">{comment.timeSince}</span>
                                </div>
                                <p className="mt-1">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

    )
}

export default CommentSection
