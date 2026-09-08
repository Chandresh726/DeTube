'use client';
import React from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const LogIn = () => {
  return (
    <Button onClick={() => signIn()} variant="default">
      Log In
    </Button>
  );
};

export default LogIn;
