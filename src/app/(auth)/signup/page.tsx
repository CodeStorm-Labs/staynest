'use client';

import { useState, useTransition } from 'react';
import { registerWithEmail } from '@/app/(auth)/actions';
import Link from 'next/link';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await registerWithEmail({}, formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Registration failed');
      }
    });
  };

  if (success) {
    return (
      <div className="container mx-auto p-4 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Registration successful!</h1>
        <Link href="/login" className="text-blue-600 underline">
          Click here to login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600">{error}</div>}
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-500 text-white px-4 py-2 rounded"
        >
          {isPending ? 'Submitting...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 underline">
          Login
        </Link>
      </p>
    </div>
  );
} 