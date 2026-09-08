"use client";
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { addComment } from '../../../util/fetch/comment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_AVATAR } from '@/lib/constants';

const AddComment = ({ videoId, triggerUpdate }: { videoId: string; triggerUpdate: () => void }) => {
    const { data: session } = useSession();
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id || !comment.trim() || submitting) return;
        setSubmitting(true);
        try {
            await addComment(session.user.id, videoId, comment.trim());
            triggerUpdate();
            setComment('');
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setComment('');
    };

    if (!session) return null;

    return (
        <div className="my-4 flex items-start">
            <Avatar className="mr-4 size-10">
                <AvatarImage src={session?.user.image || DEFAULT_AVATAR} alt={session?.user.name ?? 'Your avatar'} />
                <AvatarFallback>{(session?.user.name ?? 'U').slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="grow">
                <form onSubmit={handleCommentSubmit} className="relative">
                    <div className="flex items-center">
                        <span className="font-semibold">{session?.user.name}</span>
                    </div>
                    <Field>
                        <FieldLabel htmlFor={`comment-${videoId}`} className="sr-only">Add a comment</FieldLabel>
                        <Textarea
                            id={`comment-${videoId}`}
                            placeholder="Add comment here"
                            value={comment}
                            onChange={handleCommentChange}
                            rows={1}
                            className="mt-2 border-x-0 border-t-0 shadow-none focus-visible:ring-1"
                        />
                    </Field>
                    {comment.trim() && (
                        <div className="mt-2 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="rounded-full"
                                onClick={handleCancel}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="rounded-full"
                                disabled={submitting}
                            >
                                Comment
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddComment;
