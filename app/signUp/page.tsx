import React from 'react'
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation';
import SignupForm from '../components/form/signUpForm'
import { authOptions } from '../util/auth';

const SignUp = async () => {
    const session = await getServerSession(authOptions);
    if (session) redirect('/')
    return (
        <SignupForm />
    )
}

export default SignUp