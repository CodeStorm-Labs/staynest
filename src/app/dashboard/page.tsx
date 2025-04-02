'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  name: string;
  email: string;
  tier?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch session information:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error occurred during logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Welcome, {user?.name || 'User'}!</h2>

        <div className="mt-4">
          <h3 className="mb-2 text-lg font-medium">User Information:</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{user?.email || 'N/A'}</p>
            </div>
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
              <p className="font-medium">{user?.id || 'N/A'}</p>
            </div>
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
              <p className="font-medium">Active</p>
            </div>
            <div className="rounded bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Membership Type</p>
              <p className="font-medium">{user?.tier === 'pro' ? 'Pro' : 'Free'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
