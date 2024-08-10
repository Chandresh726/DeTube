"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { useTheme } from '../wrapper/ThemeContext';

const LogInForm = () => {
  const { theme } = useTheme();
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
      setErrorMessage(result.error);
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
    <div className={`p-6 max-w-md mx-auto mt-10 ${theme==='dark'?'text-gray-400':'text-black'}`}>
      <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="my-1 text-lg">Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input input-bordered block w-full"
          />
        </div>
        <div>
          <div className="my-1 text-lg">Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input input-bordered block w-full"
          />
        </div>
        {errorMessage && (
          <div className="text-red-500">{errorMessage}</div>
        )}
        <button
          type="submit"
          className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md ${email && password ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
          disabled={!email || !password}
        >
          {loadingFlag ? (
            <div className="flex justify-center items-center space-x-2">
              <span>Processing</span>
              <div className="loading loading-spinner"></div>
            </div>
          ) : (
            <div>Login</div>
          )}
        </button>
      </form>
      <div className="divider"></div>
      <div className="mt-6 flex flex-col items-center">
        <button
          onClick={() => handleProviderLogin('github')}
          className="w-full py-2 px-4 font-semibold rounded-lg shadow-md bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center space-x-2 mb-4"
        >
          <FaGithub size={20} />
          <span>Login with GitHub</span>
        </button>
        <button
          onClick={() => handleProviderLogin('google')}
          className="w-full py-2 px-4 font-semibold rounded-lg shadow-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
        >
          <FaGoogle size={20} />
          <span>Login with Google</span>
        </button>
      </div>
      <div className="mt-6 text-center">
        <p className="">
          Don&apos;t have an account?{' '}
          <a
            href="/signUp"
            className="text-blue-600 hover:underline"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LogInForm;