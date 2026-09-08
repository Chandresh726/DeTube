'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordsMismatch = password !== '' && confirmPassword !== '' && password !== confirmPassword;
  const isFormValid =
    email !== '' && password !== '' && confirmPassword !== '' && name !== '' && !passwordsMismatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage(passwordsMismatch ? 'Passwords do not match' : 'Please fill all fields');
      return;
    }
    setLoadingFlag(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        signIn();
      } else {
        const error = await response.json();
        const msg = error.message ?? 'Registration failed';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoadingFlag(false);
    }
  };

  return (
    <Card className="mx-auto mt-2 max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Join DeTube today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="signup-name">Name</FieldLabel>
              <Input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field data-invalid={passwordsMismatch}>
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-invalid={passwordsMismatch}
              />
            </Field>
            <Field data-invalid={passwordsMismatch}>
              <FieldLabel htmlFor="signup-confirm">Confirm Password</FieldLabel>
              <Input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-invalid={passwordsMismatch}
              />
            </Field>
            {(errorMessage || passwordsMismatch) && (
              <p role="alert" aria-live="assertive" className="text-center text-sm text-destructive">
                {errorMessage || 'Passwords do not match'}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={!isFormValid || loadingFlag}>
              {loadingFlag ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Processing
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </FieldGroup>
        </form>
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/logIn" className="text-primary underline-offset-4 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
