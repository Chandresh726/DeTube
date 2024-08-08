import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import UploadVideoForm from '../components/form/uploadVideoForm';

const uplaodVideo = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/')
  if (!session.user.channelId) redirect('/createChannel')
  return (
    <UploadVideoForm channelId={session.user.channelId} />
  )
}

export default uplaodVideo