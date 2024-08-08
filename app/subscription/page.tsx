import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SubscriptionPage from '../components/SubscriptionPage'

const Subscription = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/')
  return (
    <SubscriptionPage id={session.user.id} />
  )
}

export default Subscription