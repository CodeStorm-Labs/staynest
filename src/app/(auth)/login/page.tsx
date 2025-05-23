'use client';

import { useState, useTransition } from 'react';
import { loginWithEmail } from '@/app/(auth)/actions';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginWithEmail({}, formData);
      if (res.success) {
        window.location.href = '/dashboard';
      } else {
        setError(res.error || 'Login failed');
      }
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600">{error}</div>}
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
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isPending ? 'Loading...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{' '}
        <Link href="/signup" className="text-blue-600 underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
} 