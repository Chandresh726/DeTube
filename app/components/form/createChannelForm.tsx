'use client';
import { useState } from 'react';
import { MdUpload } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { getPresignedUrl, hitPresignedurl } from '../../util/fetch/r2';
import { createChannel } from '../../util/fetch/channel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CreateChannelForm = ({ userId }: { userId: number | string }) => {
  const { data: session, update } = useSession();

  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loadingFlag, setLoadingFlag] = useState(false);

  const router = useRouter();
  const [logoId] = useState(() => crypto.randomUUID());

  const isFormValid = channelName !== '' && description !== '' && logo !== null && !uploadingLogo;
  void session;

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const { presignedUrl, url } = await getPresignedUrl('channel-logo', logoId, file.type, file.size);
      const uploadResponse = await hitPresignedurl(presignedUrl, file);

      if (uploadResponse.ok) {
        setLogo(url);
      } else {
        toast.error('Logo upload failed');
      }
    } catch (error) {
      toast.error('Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logo) {
      toast.error('Channel logo is required');
      return;
    }
    setLoadingFlag(true);
    try {
      const response = await createChannel(userId, channelName, description, logo);
      if (response && response.channelId) {
        await update({ channelId: response.channelId });
        router.push('/channel/' + response.channelId);
      } else {
        toast.error('Failed to create channel');
      }
    } catch (error) {
      toast.error('Failed to create channel');
    } finally {
      setLoadingFlag(false);
    }
  };

  return (
    <Card className="mx-auto mt-10 max-w-4xl">
      <CardHeader>
        <CardTitle>Create Channel</CardTitle>
        <CardDescription>Set up your presence on DeTube</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Field className="sm:max-w-60">
                <FieldLabel htmlFor="channel-logo">Channel Logo</FieldLabel>
                <div className="relative aspect-square size-56 overflow-hidden rounded-xl border">
                  {uploadingLogo ? (
                    <Skeleton className="h-full w-full rounded-xl" />
                  ) : logo ? (
                    <Avatar className="size-full rounded-xl">
                      <AvatarImage src={logo} alt="Channel logo preview" className="object-cover" />
                      <AvatarFallback>{channelName.slice(0, 2).toUpperCase() || 'CH'}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  <label
                    htmlFor="channel-logo"
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-background/60 text-sm font-medium opacity-100 transition-opacity hover:bg-background/80"
                  >
                    <Input
                      id="channel-logo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingLogo}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    {uploadingLogo ? (
                      'Uploading...'
                    ) : logo ? (
                      'Change Logo'
                    ) : (
                      <span className="flex items-center gap-1">
                        Upload
                        <MdUpload aria-hidden />
                      </span>
                    )}
                  </label>
                </div>
              </Field>
              <div className="flex w-full flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="channel-name">Channel Name</FieldLabel>
                  <Input
                    id="channel-name"
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="channel-desc">Description</FieldLabel>
                  <Textarea
                    id="channel-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                  />
                </Field>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={!isFormValid || loadingFlag}>
              {loadingFlag ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Processing
                </>
              ) : (
                'Create Channel'
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateChannelForm;
