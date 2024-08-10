import React from 'react'
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import CreateChannelForm from '../components/form/createChannelForm';
import { authOptions } from '../util/auth';

const CreateChannel = async () => {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/')
    if(session.user.channelId) redirect('/')
    return (
        <CreateChannelForm userId={session.user.id} />
    )
}

export default CreateChannel