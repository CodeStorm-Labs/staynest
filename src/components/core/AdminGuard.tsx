'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
        
        // Always verify with the API regardless
        const response = await fetch('/api/auth/verify-admin', {
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (response.ok && data.isAdmin) {
          setIsAuthenticated(true);
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }
        
        // If not admin, check if authenticated
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          // User is authenticated, but not admin - redirect to dashboard
          router.push(`/${locale}/dashboard`);
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Yükleniyor...</h1>
          <p className="text-gray-900">Yönetici erişimi doğrulanıyor</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
} 