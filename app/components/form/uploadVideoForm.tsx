"use client";
import React, { useState } from 'react'
import { MdUpload } from "react-icons/md";
import { useRouter } from 'next/navigation'
import { toast } from 'sonner';
import { getPresignedUrl, hitPresignedurl, hitVideoPresignedurl } from '../../util/fetch/r2';
import { createVideo } from '../../util/fetch/video';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

const UploadVideoForm = ({ channelId }: { channelId: number }) => {
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [videoId] = useState<string>(() => crypto.randomUUID());
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [progress, setProgress] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loadingFlag, setLoadingFlag] = useState(false);

    const isFormValid =
        title !== '' &&
        description !== '' &&
        thumbnail !== null &&
        video !== null &&
        !uploadingThumbnail &&
        !uploadingVideo;

    const router = useRouter()

    const handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setUploadingThumbnail(true)
            const { presignedUrl, url } = await getPresignedUrl('thumbnail', videoId, file.type, file.size);
            const uploadResponse = await hitPresignedurl(presignedUrl, file)

            if (uploadResponse.ok) {
                setThumbnail(url)
            } else {
                toast.error('Thumbnail upload failed');
            }
        } catch (error) {
            toast.error('Thumbnail upload failed');
        } finally {
            setUploadingThumbnail(false)
        }
    };

    const handleVideoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setUploadingVideo(true)
            setProgress(0)
            const { presignedUrl, url } = await getPresignedUrl('temp-video', videoId, file.type, file.size);
            const uploadResponse = await hitVideoPresignedurl(presignedUrl, file, (p) => {
                setProgress(p);
            });

            if (uploadResponse.DONE) {
                setVideo(url)
            } else {
                toast.error('Video upload failed');
            }
        } catch (error) {
            toast.error('Video upload failed');
        } finally {
            setUploadingVideo(false)
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!thumbnail) {
            toast.error('Thumbnail is required');
            return;
        }
        if (!video) {
            toast.error('Video is required');
            return;
        }
        setLoadingFlag(true)
        try {
            const response = await createVideo(channelId, videoId, title, description, thumbnail, video);
            if (response && response.videoId) {
                router.push('/video/' + response.videoId)
            } else {
                toast.error('Failed to publish video');
            }
        } catch (error) {
            toast.error('Failed to publish video');
        } finally {
            setLoadingFlag(false)
        }
    };

    return (
        <Card className="mx-auto p-0 lg:mx-32">
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
            <CardDescription>Publish to your channel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col gap-4 md:flex-row">
                    <Field>
                        <FieldLabel htmlFor="upload-thumbnail">Upload Thumbnail</FieldLabel>
                        <div className="relative aspect-video overflow-hidden rounded-xl border md:w-96">
                            {uploadingThumbnail ? (
                                <Skeleton className="h-full w-full rounded-none" />
                            ) : (thumbnail ?
                                <img src={thumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-muted" />
                            )}
                            <label htmlFor="upload-thumbnail" className="absolute inset-0 flex cursor-pointer items-center justify-center bg-background/60 text-sm font-medium hover:bg-background/80">
                                <Input
                                    id="upload-thumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    disabled={uploadingThumbnail}
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                />
                                {uploadingThumbnail ? 'Uploading...'
                                    : (thumbnail ? 'Change Thumbnail'
                                        : (<span className="flex items-center gap-2">Upload<MdUpload aria-hidden /></span>))
                                }
                            </label>
                        </div>
                    </Field>

                    <div className="flex w-full flex-col gap-4">
                        <Field>
                            <FieldLabel htmlFor="upload-video">Select Video</FieldLabel>
                            <Input
                                id="upload-video"
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                            />
                            {uploadingVideo || progress > 0 ? (
                              <div className="flex flex-col gap-1" aria-live="polite">
                                <Progress value={progress} />
                                <span className="text-xs text-muted-foreground">
                                  {uploadingVideo ? `Uploading… ${progress}%` : `Uploaded ${progress}%`}
                                </span>
                              </div>
                            ) : null}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="upload-title">Title</FieldLabel>
                            <Input
                                id="upload-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Field>
                    </div>
                </div>

                <Field>
                    <FieldLabel htmlFor="upload-desc">Description</FieldLabel>
                    <Textarea
                        id="upload-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                    />
                </Field>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={!isFormValid || loadingFlag}
                >
                    {loadingFlag ?
                        <>
                          <Spinner data-icon="inline-start" />
                          Processing
                        </>
                        : "Publish Video"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
    )
}

export default UploadVideoForm
