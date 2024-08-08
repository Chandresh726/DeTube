import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SignupForm from '../components/form/signUpForm'

const SignUp = async () => {
    const session = await getServerSession(authOptions);
    if (session) redirect('/')
    return (
        <SignupForm />
    )
}

export default SignUp