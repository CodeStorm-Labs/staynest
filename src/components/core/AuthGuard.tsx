'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { locale } = useParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check for admin_session cookie
        const cookies = document.cookie.split(';');
        const hasAdminSession = cookies.some(cookie => 
          cookie.trim().startsWith('admin_session=true')
        );
        
        if (hasAdminSession) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // If no admin session, check Better Auth session
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          router.push(`/${locale}/login`);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push(`/${locale}/login`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, locale]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Yükleniyor...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 