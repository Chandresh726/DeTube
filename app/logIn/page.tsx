import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import LogInForm from '../components/form/logInForm'

const LogIn = async () => {
    const session = await getServerSession(authOptions);
    if (session) redirect('/')
    return (
        <LogInForm />
    )
}

export default LogIn