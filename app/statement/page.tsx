import { getServerSession } from 'next-auth';
import React from 'react'
import { authOptions } from '../util/auth';
import { redirect } from 'next/navigation';
import Statement from '../components/web3/Statement';

const StatementPage = async () => {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/')
    return (
        <Statement session={session} />
    )
}

export default StatementPage