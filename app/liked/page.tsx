import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import LikedPage from '../components/LikedPage';

const Liked = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/')
  return (
    <LikedPage id={session.user.id} />
  )
}

export default Liked