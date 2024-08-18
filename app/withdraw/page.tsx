import React from 'react'
import { getServerSession } from 'next-auth';
import { authOptions } from '../util/auth';
import { redirect } from 'next/navigation';
import Withdraw from '../components/web3/Withdraw';

const WithdrawPage = async () => {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/')
    return (
        <Withdraw session={session} />
    )
}

export default WithdrawPage