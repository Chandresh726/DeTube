"use client";
import React, { useEffect } from 'react'
import { useState } from 'react';
import { MdUpload } from "react-icons/md";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'
import ProgressBar from '../video/progressBar';
import { getPresignedUrl, hitPresignedurl, hitVideoPresignedurl } from '../../util/fetch/s3';
import { createVideo } from '../../util/fetch/video';
import { useTheme } from '../ThemeContext';

const UploadVideoForm = ({ channelId }: { channelId: Number }) => {
    const { theme } = useTheme();
    const [thumbnail, setThumbnail] = useState<string | ArrayBuffer | null>(null);
    const [video, setVideo] = useState<string | File | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [progress, setProgress] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);

    useEffect(() => {
        setIsFormValid(title !== '' && description !== '' && thumbnail !== null && video !== null);
    }, [title, description, thumbnail, video]);

    useEffect(() => {
        setVideoId(uuidv4() as string)
    }, []);

    const router = useRouter()

    const handleThumbnailChange = async (event) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setUploadingThumbnail(true)
                // Send request to get presigned URL
                const { presignedUrl, url } = await getPresignedUrl('thumbnail', videoId);

                // Upload the file using the presigned URL
                const uploadResponse = await hitPresignedurl(presignedUrl, file)

                if (uploadResponse.ok) {
                    setThumbnail(url)
                } else {
                    console.error('Upload failed with status:', uploadResponse.status);
                }
                setUploadingThumbnail(false)
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleVideoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setUploadingVideo(true)
                // Send request to get presigned URL
                const { presignedUrl, url } = await getPresignedUrl('temp-video', videoId);

                // Upload the file using the presigned URL
                const uploadResponse = await hitVideoPresignedurl(presignedUrl, file, (progress) => {
                    setProgress(progress);
                });

                if (uploadResponse.DONE) {
                    setVideo(url)
                } else {
                    console.error('Upload failed with status:', uploadResponse.status);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        setLoadingFlag(true)
        e.preventDefault();
        if (!thumbnail) {
            console.error('Thumbnail is required');
            return;
        }
        if (!video) {
            console.error('Video is required');
            return;
        }
        let redirectPath = "/"
        try {
            const response = await createVideo(channelId, videoId, title, description, thumbnail, video);
            console.log('create video res', response);
            if (response && response.videoId) {
                redirectPath = '/video/' + response.videoId
                setLoadingFlag(false)
            } else {
                console.error('Failed to update Session');
            }
        } catch (error) {
            console.error('Error creating channel:', error);
        }
        router.push(redirectPath)
    };

    return (
        <div className={`p-2 lg:mx-32 mx-auto ${theme==='dark'?'text-gray-400':'text-black'}`}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="md:relative md:flex space-x-4">
                    <div>
                        <div className="my-2 text-lg">Upload Thumbnail</div>
                        <div className="relative md:w-96 aspect-video border border-gray-600 rounded-lg overflow-hidden">
                            {uploadingThumbnail ? (
                                <div className="skeleton h-full w-full"></div>
                            ) : (thumbnail ?
                                <img src={thumbnail as string} alt="Thumbnail Preview" className="w-full h-full object-cover" /> : <div className="h-full w-full"></div>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    disabled={uploadingThumbnail}
                                    className="opacity-0 absolute inset-0"
                                />
                                {uploadingThumbnail ? 'Uploading...'
                                    : (thumbnail ? 'Change Thumbnail'
                                        : (<div className='flex items-center justify-center'> Upload
                                            <MdUpload className='w-5 h-5 mx-2' />
                                        </div>))
                                }
                            </label>
                        </div>
                    </div>

                    <div className='hidden md:block w-full'>
                        <div>
                            <div className="my-2 text-lg">Select Video</div>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="file-input file-input-bordered w-full"
                            />
                            <ProgressBar progress={progress} flag={uploadingVideo} />
                        </div>
                        <div>
                            <div className="my-2 text-lg">Title</div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="input input-bordered block w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className='md:hidden'>
                    <div className='w-full'>
                        <div>
                            <div className="my-2 text-lg">Select Video</div>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="file-input file-input-bordered w-full"
                            />
                            <ProgressBar progress={progress} flag={uploadingVideo} />
                        </div>
                        <div>
                            <div className="my-2 text-lg">Title</div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="input input-bordered block w-full"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="my-2 text-lg">Description</div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="textarea textarea-bordered block w-full"
                        rows={4}
                    />
                </div>
                <button
                    type="submit"
                    className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                    disabled={!isFormValid}
                >
                    {loadingFlag ?
                        <div className="flex justify-center items-center space-x-2">
                            <span>Processing</span>
                            <div className="loading loading-spinner"></div>
                        </div>
                        : <div>Submit</div>}
                </button>
            </form>
        </div>
    )
}

export default UploadVideoForm
