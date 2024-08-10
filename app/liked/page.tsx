import React from 'react'
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import LikedPage from '../components/LikedPage';
import { authOptions } from '../util/auth';

const Liked = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/')
  return (
    <LikedPage id={session.user.id} />
  )
}

export default Liked