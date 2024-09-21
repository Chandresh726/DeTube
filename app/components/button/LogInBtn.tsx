"use client";
import React from 'react'
import { signIn  } from "next-auth/react"

const LogIn = () => {
  return (
    <button onClick={() => signIn()} className="btn btn-active">Log In</button>
  )
}

export default LogIn