import React from 'react'
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import UploadVideoForm from '../components/form/uploadVideoForm';
import { authOptions } from '../util/auth';

const uplaodVideo = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/')
  if (!session.user.channelId) redirect('/createChannel')
  return (
    <UploadVideoForm channelId={session.user.channelId} />
  )
}

export default uplaodVideo