"use client";
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { addComment } from '../../../util/fetch/comment';

const AddComment = ({ videoId, triggerUpdate }) => {
    const { data: session } = useSession();
    const [comment, setComment] = useState('');

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        // Handle comment submission logic here
        addComment(session?.user.id, videoId, comment);
        triggerUpdate();
        setComment(''); // Clear the textarea after submission
    };

    const handleCancel = () => {
        setComment('');
    };

    if (!session) return (
        <div></div>
    )

    return (
        <div className="flex items-start my-4">
            <img
                src={session?.user.image || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"}
                alt={session?.user.name}
                className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div className="flex-grow">
                <form onSubmit={handleCommentSubmit} className="relative">
                    <div className="flex items-center">
                        <span className="font-semibold">{session?.user.name}</span>
                    </div>
                    <textarea
                        className="w-full p-2 mt-2 bg-transparent border-b-2 border-gray-700 focus:outline-none focus:border-white"
                        placeholder="Add comment here"
                        value={comment}
                        onChange={handleCommentChange}
                        rows={1}
                    />
                    {comment && (
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-3xl bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-300"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-3xl bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                Comment
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddComment;