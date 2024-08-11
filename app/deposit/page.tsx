import React from 'react'
import Deposit from '../components/web3/Deposit';
import { getServerSession } from 'next-auth';
import { authOptions } from '../util/auth';
import { redirect } from 'next/navigation';

const DepositPage = async () => {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/')
    return (
        <Deposit session={session} />
    )
}

export default DepositPage