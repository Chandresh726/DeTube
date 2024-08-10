import React from 'react'
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import SubscriptionPage from '../components/SubscriptionPage'
import { authOptions } from '../util/auth';

const Subscription = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/')
  return (
    <SubscriptionPage id={session.user.id} />
  )
}

export default Subscription