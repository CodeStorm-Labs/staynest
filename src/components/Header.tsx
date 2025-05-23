'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for admin_session cookie
        const cookies = document.cookie.split(';');
        const hasAdminSession = cookies.some(cookie => 
          cookie.trim().startsWith('admin_session=true')
        );
        
        if (hasAdminSession) {
          // Verify admin status
          const adminResponse = await fetch('/api/auth/verify-admin', {
            credentials: 'include'
          });
          
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            if (adminData.isAdmin) {
              setUser({
                name: 'Admin User',
                email: 'admin@example.com'
              });
              setIsAdmin(true);
              setIsLoading(false);
              return;
            }
          }
        }
        
        // Check regular auth session
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear admin session if exists
      if (isAdmin) {
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      
      // Clear regular auth session
      await authClient.signOut();
      
      // Reset state
      setUser(null);
      setIsAdmin(false);
      
      // Redirect to home
      router.push('/tr');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-black/70 backdrop-blur-sm py-6'
    }`}>
      <nav className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/tr" className="flex items-center group">
          <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg transition-all duration-300 group-hover:shadow-blue-400/30">
            <Image
              src="/images/staynest-logo.svg"
              alt="StayNest Vacation Logo" 
              width={64}
              height={64}
              className="object-contain transition-transform duration-300 group-hover:scale-110"
              priority
            />
          </div>
          <div className="ml-3">
            <span className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
              isScrolled ? 'text-black' : 'text-white'
            }`}>
              StayNest
            </span>
            <div className={`h-0.5 w-0 group-hover:w-full transition-all duration-500 ${
              isScrolled ? 'bg-blue-600' : 'bg-blue-300'
            }`}></div>
          </div>
        </Link>
        
        <ul className={`hidden md:flex items-center space-x-8 transition-colors duration-300 ${
          isScrolled ? 'text-gray-900' : 'text-white'
        }`}>
          <li>
            <Link href="/tr/listings" className="hover:text-blue-500 font-medium transition-colors relative group">
              İlanlar
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="/tr/hakkimizda" className="hover:text-blue-500 font-medium transition-colors relative group">
              Hakkımızda
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="/tr/iletisim" className="hover:text-blue-500 font-medium transition-colors relative group">
              İletişim
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
        </ul>
        
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : user ? (
            <>
              {isAdmin ? (
                <Link
                  href="/tr/admin"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isScrolled 
                      ? 'text-purple-700 hover:bg-purple-50' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Yönetici Paneli
                </Link>
              ) : (
                <Link
                  href="/tr/dashboard"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isScrolled 
                      ? 'text-black hover:text-blue-600' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Panel
                </Link>
              )}
              
              <div className="relative group">
                <button 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                    isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full bg-red-100 flex items-center justify-center ${
                    isScrolled ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {user.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className={isScrolled ? 'text-gray-900' : 'text-white'}>
                    {user.name || 'Kullanıcı'}
                  </span>
                </button>
                
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                  <Link href="/tr/dashboard" className="block px-4 py-2 text-black hover:bg-gray-100">
                    Kontrol Paneli
                  </Link>
                  <Link href="/tr/settings" className="block px-4 py-2 text-black hover:bg-gray-100">
                    Hesap Ayarları
                  </Link>
                  <Link href="/tr/listings/new" className="block px-4 py-2 text-black hover:bg-gray-100">
                    Yeni İlan Oluştur
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/tr/login"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isScrolled 
                    ? 'text-blue-600 hover:bg-blue-50' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Giriş Yap
              </Link>
              <Link
                href="/tr/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
} 