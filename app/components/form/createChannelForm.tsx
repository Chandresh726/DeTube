"use client";
import { useEffect, useState } from 'react';
import { MdUpload } from "react-icons/md";
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { getPresignedUrl, hitPresignedurl } from '../../util/fetch/s3';
import { createChannel } from '../../util/fetch/channel';
import { useTheme } from '../wrapper/ThemeContext';

const CreateChannelForm = ({ userId }: { userId: Number }) => {
  const { theme } = useTheme();
  const { data: session, status, update } = useSession()

  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [loadingFlag, setLoadingFlag] = useState(false);

  const router = useRouter()
  const logoid = uuidv4();

  useEffect(() => {
    setIsFormValid(channelName !== '' && description !== '' && logo !== null);
  }, [channelName, description, logo]);

  const handleImageChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setUploadingLogo(true)
        // Send request to get presigned URL
        const { presignedUrl, url } = await getPresignedUrl('channel-logo', logoid);

        // Upload the file using the presigned URL
        const uploadResponse = await hitPresignedurl(presignedUrl, file)

        if (uploadResponse.ok) {
          setLogo(url)
        } else {
          console.error('Upload failed with status:', uploadResponse.status);
        }
        setUploadingLogo(false)
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoadingFlag(true)
    e.preventDefault();
    if (!logo) {
      console.error('Logo is required');
      return;
    }
    let redirectPath = "/"
    try {
      const response = await createChannel(userId, channelName, description, logo);
      if (response && response.channelId) {
        redirectPath = '/channel/' + response.channelId
        update({ channelId: response.channelId });
      } else {
        console.error('Failed to update Session');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
    router.push(redirectPath)
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto mt-10 ${theme==='dark'?'text-gray-400':'text-black'}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative flex space-x-4">
          <div className='m-2'>
            <div className="my-2 text-lg">Channel Logo</div>
            <div className="relative h-56 w-56 aspect-square border border-gray-600 rounded-lg overflow-hidden">
              {uploadingLogo ? (
                <div className="skeleton h-full w-full"></div>
              ) : (logo ?
                <img src={logo as string} alt="Logo Preview" className="w-full h-full object-cover" /> : <div className="h-full w-full"></div>
              )}
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingLogo}
                  className="opacity-0 absolute inset-0"
                />
                {uploadingLogo ? 'Uploading...'
                  : (logo ? 'Change Logo'
                    : (<div className='flex items-center justify-center'>
                      Upload
                      <MdUpload className='w-5 h-5 mx-1' />
                    </div>))
                }
              </label>
            </div>
          </div>
          <div className='m-2 w-full'>
            <div>
              <div className="my-2 text-lg">Channel Name</div>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
                className="input input-bordered block w-full"
              />
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
          </div>
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
            : <div>Create Channel</div>}
        </button>
      </form>
    </div>
  );
};

export default CreateChannelForm;
