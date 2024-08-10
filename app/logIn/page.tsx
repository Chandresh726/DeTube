import React from 'react'
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import LogInForm from '../components/form/logInForm'
import { authOptions } from '../util/auth';

const LogIn = async () => {
    const session = await getServerSession(authOptions);
    if (session) redirect('/')
    return (
        <LogInForm />
    )
}

export default LogIn