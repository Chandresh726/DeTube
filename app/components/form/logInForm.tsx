'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

const LogInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingFlag(true);
    const result = await signIn('credentials', {
      email,
      password,
    });

    if (result?.error) {
      setErrorMessage('Invalid Email/Password');
    } else {
      setErrorMessage('');
    }
    setLoadingFlag(false);
  };

  const handleProviderLogin = async (provider: string) => {
    setLoadingFlag(true);
    await signIn(provider);
    setLoadingFlag(false);
  };

  return (
    <Card className="mx-auto mt-10 max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Welcome back to DeTube</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage('');
                }}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                required
              />
            </Field>
            <Button type="submit" className="w-full" disabled={!email || !password || loadingFlag}>
              {loadingFlag ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Processing
                </>
              ) : (
                'Login'
              )}
            </Button>
            {errorMessage && (
              <p role="alert" aria-live="assertive" className="text-center text-sm text-destructive">
                {errorMessage}
              </p>
            )}
          </FieldGroup>
        </form>
        <Separator className="my-6" />
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={() => handleProviderLogin('github')}
            variant="secondary"
            className="w-full"
            disabled={loadingFlag}
          >
            <FaGithub data-icon="inline-start" />
            Login with GitHub
          </Button>
          <Button
            onClick={() => handleProviderLogin('google')}
            variant="outline"
            className="w-full"
            disabled={loadingFlag}
          >
            <FaGoogle data-icon="inline-start" />
            Login with Google
          </Button>
        </div>
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signUp" className="text-primary underline-offset-4 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogInForm;
