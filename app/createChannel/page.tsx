import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import CreateChannelForm from '../components/form/createChannelForm';

const CreateChannel = async () => {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/')
    if(session.user.channelId) redirect('/')
    return (
        <CreateChannelForm userId={session.user.id} />
    )
}

export default CreateChannel