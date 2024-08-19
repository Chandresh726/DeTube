"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react"
import { useTheme } from '../wrapper/ThemeContext';

const SignupForm = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  useEffect(() => {
    setIsFormValid(
      email !== '' &&
      password !== '' &&
      confirmPassword !== '' &&
      password === confirmPassword &&
      name !== ''
    );
  }, [email, password, confirmPassword, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const data = await response.json();
        signIn()
        // router.push('/login');
      } else {
        const error = await response.json();
        setErrorMessage(error.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoadingFlag(false);
    }
  };

  return (
    <div className={`p-6 max-w-md mx-auto mt-10 ${theme==='dark'?'text-gray-400':'text-black'}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="my-2 text-lg">Name</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input input-bordered block w-full"
          />
        </div>
        <div>
          <div className="my-2 text-lg">Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input input-bordered block w-full"
          />
        </div>
        <div>
          <div className="my-2 text-lg">Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input input-bordered block w-full"
          />
        </div>
        <div>
          <div className="my-2 text-lg">Confirm Password</div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input input-bordered block w-full"
          />
        </div>
        {errorMessage && (
          <div className="text-red-500">{errorMessage}</div>
        )}
        <button
          type="submit"
          className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
          disabled={!isFormValid}
        >
          {loadingFlag ? (
            <div className="flex justify-center items-center space-x-2">
              <span>Processing</span>
              <div className="loading loading-spinner"></div>
            </div>
          ) : (
            <div>Sign Up</div>
          )}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="">
          Already have an account?{' '}
          <a
            href="/logIn"
            className="text-blue-600 hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
