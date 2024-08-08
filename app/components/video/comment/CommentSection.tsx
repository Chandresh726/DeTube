"use client";
import React, { useEffect, useState } from 'react'
import AddComment from './AddComment';
import { getComments } from '../../../util/fetch/comment';

const CommentSection = ({ videoId }) => {
    const [comments, setComments] = useState(null);
    const [flag, setFlag] = useState(false);

    const updateComments = async () => {
        const data = await getComments(videoId);
        if (data) {
            setComments(data.comments);
        }
    }

    const triggerUpdate = () => {
        setFlag(!flag)
    }

    useEffect(() => {
        updateComments()
    }, [flag])

    if (!comments) return <div></div>

    return (
        <div>
            <h3 className="text-2xl font-bold">Comments</h3>
            <AddComment videoId={videoId} triggerUpdate={triggerUpdate} />
            <div>
                {comments.length === 0 ? (
                    <p className="mt-2 text-gray-600">No comments yet.</p>
                ) : (
                    comments.map((comment, index) => (
                        <div key={index} className="flex items-start my-4">
                            <img
                                src={comment.image || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"}
                                alt={comment.name}
                                className="w-10 h-10 rounded-full object-cover mr-4"
                            />
                            <div className="flex-grow">
                                <div className="flex items-center">
                                    <span className="font-semibold">{comment.name}</span>
                                    <span className='ml-10 text-xs text-gray-400'>{comment.timeSince}</span>
                                </div>
                                <p>{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

    )
}

export default CommentSection