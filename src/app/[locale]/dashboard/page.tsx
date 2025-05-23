'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import ReviewForm from '@/components/ReviewForm';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import CancelBookingButton from '@/components/CancelBookingButton';
import AuthGuard from '@/components/core/AuthGuard';

interface User {
  id: string;
  name: string;
  email: string;
  tier?: string;
}

interface Booking {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  title: string;
  address: string;
  price: number;
}

interface Listing {
  id: string;
  title: string;
  address: string;
  price: number;
  propertyType: string;
}

export default function Dashboard() {
  const { locale } = useParams();
  const searchParams = useSearchParams();
  const bookingSuccess = searchParams.get('booking') === 'success';
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loadingMyListings, setLoadingMyListings] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    bookingSuccess ? 'Rezervasyonunuz başarıyla oluşturuldu!' : null
  );
  const router = useRouter();

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // First check for admin_session cookie
        const cookies = document.cookie.split(';');
        const hasAdminSession = cookies.some(cookie => 
          cookie.trim().startsWith('admin_session=true')
        );
        
        if (hasAdminSession) {
          // For admin session, create a temporary user object
          setUser({
            id: 'admin',
            name: 'Admin User',
            email: 'admin@example.com',
            tier: 'pro'
          });
          setLoading(false);
          return;
        }
        
        // If no admin session, try Better Auth
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          router.push(`/${locale}`);
        }
      } catch (error) {
        console.error('Failed to fetch session information:', error);
        router.push(`/${locale}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, locale]);

  // Fetch bookings after user is loaded
  useEffect(() => {
    if (!loading) {
      setLoadingBookings(true);
      fetch('/api/bookings', {
        credentials: 'include', // This includes cookies in the request
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((res) => {
          if (!res.ok) {
            if (res.status === 401) {
              console.error('Unauthorized request to bookings API');
              return { error: 'Unauthorized' };
            }
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data.error) setBookings(data);
          else console.error('Error fetching bookings:', data.error);
        })
        .catch((err) => console.error('Failed to fetch bookings:', err))
        .finally(() => setLoadingBookings(false));
    }
  }, [loading]);

  // Fetch host's listings after user is loaded
  useEffect(() => {
    if (!loading) {
      setLoadingMyListings(true);
      fetch('/api/listings?userOnly=true', {
        credentials: 'include', // This includes cookies in the request
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((res) => {
          if (!res.ok) {
            if (res.status === 401) {
              console.error('Unauthorized request to listings API');
              return { error: 'Unauthorized' };
            }
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data.error) setMyListings(data);
          else console.error('Error fetching listings:', data.error);
        })
        .catch((err) => console.error('Failed to fetch listings:', err))
        .finally(() => setLoadingMyListings(false));
    }
  }, [loading]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push(`/${locale}`);
    } catch (error) {
      console.error('Error occurred during logout:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'CONFIRMED':
        return 'Onaylandı';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return 'Onay Bekliyor';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Yükleniyor...</h1>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.checkOut) >= new Date() && b.status !== 'CANCELLED'
  );
  
  const pastBookings = bookings.filter(
    (b) => new Date(b.checkOut) < new Date() || b.status === 'CANCELLED'
  );

  return (
    <AuthGuard>
    <div className="bg-gray-50 min-h-screen pb-20">
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}
    
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black border-b pb-2 border-gray-200">Kontrol Paneli</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 font-medium"
          >
            Çıkış Yap
          </button>
        </div>
        
        {/* User Information Card */}
        <div className="mb-10 rounded-2xl bg-white p-8 shadow-md">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 text-red-600 rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl mr-4">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">{user?.email === 'admin@example.com' ? 'Admin Kullanıcısı' : user?.name || 'Kullanıcı'}</h2>
              <p className="text-black">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-black font-medium mb-1">Eposta</p>
              <p className="font-medium text-black">{user?.email || 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-black font-medium mb-1">Kullanıcı ID</p>
              <p className="font-medium text-black truncate">{user?.id || 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-black font-medium mb-1">Hesap Durumu</p>
              <p className="font-medium text-green-600">Aktif</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-black font-medium mb-1">Üyelik Tipi</p>
              <p className="font-medium text-black">{user?.tier === 'pro' ? 'Pro Üyelik' : 'Standart Üyelik'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10 flex flex-wrap gap-4">
          <Link 
            href={`/${locale}/listings/new`} 
            className="rounded-lg border border-gray-200 bg-white py-3 px-6 font-medium hover:bg-gray-50 transition-colors flex items-center text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni İlan Oluştur
          </Link>
          
          <Link 
            href={`/${locale}/listings`} 
            className="rounded-lg border border-gray-200 bg-white py-3 px-6 font-medium hover:bg-gray-50 transition-colors flex items-center text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            İlanları Keşfet
          </Link>
        </div>

        {/* Upcoming Bookings Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-black border-b pb-2 border-gray-200">Yaklaşan Rezervasyonlarım</h2>
          
          {loadingBookings ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-black">Rezervasyonlar yükleniyor...</p>
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeClass(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    
                    <h3 className="font-bold text-xl mt-3 mb-2">{booking.title}</h3>
                    <p className="text-black text-sm mb-4">{booking.address}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm text-black font-medium">Giriş - Çıkış</p>
                          <p className="font-medium text-black">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-black font-medium">Misafir Sayısı</p>
                          <p className="font-medium text-black">{booking.guests} kişi</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-black mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-black font-medium">Toplam Tutar</p>
                          <p className="font-bold text-red-600">{booking.totalPrice}₺</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
                    <Link 
                      href={`/${locale}/listings/${booking.listingId}`}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      İlanı Görüntüle
                    </Link>
                    
                    {booking.status === 'PENDING' && (
                      <CancelBookingButton 
                        bookingId={booking.id} 
                        onSuccess={() => {
                          setSuccessMessage('Rezervasyon başarıyla iptal edildi');
                          // Update the booking in the UI
                          setBookings(bookings.map(b => 
                            b.id === booking.id 
                              ? {...b, status: 'CANCELLED'} 
                              : b
                          ));
                        }} 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-black mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2 text-black">Yaklaşan rezervasyonunuz bulunmuyor</h3>
              <p className="text-black mb-4">Hemen yeni bir rezervasyon yaparak seyahatinizi planlayın.</p>
              <Link 
                href={`/${locale}/listings`}
                className="inline-block bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                İlan Bul
              </Link>
            </div>
          )}
        </div>
        
        {/* Past Bookings Section */}
        {pastBookings.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-black border-b pb-2 border-gray-200">Geçmiş Rezervasyonlarım</h2>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Konaklama
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Tarihler
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Tutar
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Durum
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pastBookings.map((booking) => {
                      const isReviewable = new Date(booking.checkOut) < new Date() && booking.status === 'CONFIRMED';
                      
                      return (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-black">{booking.title}</div>
                                <div className="text-sm text-black">{booking.address}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black">{formatDate(booking.checkIn)}</div>
                            <div className="text-sm text-black">- {formatDate(booking.checkOut)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-black">{booking.totalPrice}₺</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link 
                              href={`/${locale}/listings/${booking.listingId}`}
                              className="text-red-600 hover:text-red-800 mr-4"
                            >
                              Görüntüle
                            </Link>
                            {isReviewable && (
                              <ReviewForm bookingId={booking.id} />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* My Listings Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black border-b pb-2 border-gray-200">İlanlarım</h2>
            <Link 
              href={`/${locale}/listings/new`}
              className="flex items-center text-red-600 hover:text-red-800 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni İlan Ekle
            </Link>
          </div>
          
          {loadingMyListings ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-black">İlanlar yükleniyor...</p>
            </div>
          ) : myListings.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        İlan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Adres
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        Tür
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myListings.map((listing) => (
                      <tr key={listing.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-black">{listing.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-black">{listing.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-black">{listing.price}₺ / gece</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {listing.propertyType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/${locale}/listings/${listing.id}`}
                            className="text-red-600 hover:text-red-800 mr-4"
                          >
                            Görüntüle
                          </Link>
                          <Link
                            href={`/${locale}/listings/${listing.id}/edit`}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Düzenle
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
                                await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' });
                                setMyListings(myListings.filter((item) => item.id !== listing.id));
                                setSuccessMessage('İlan başarıyla silindi.');
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-black mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h3 className="text-lg font-medium mb-2 text-black">Henüz ilan oluşturmadınız</h3>
              <p className="text-black mb-4">İlk ilanınızı oluşturarak kazanmaya başlayın.</p>
              <Link 
                href={`/${locale}/listings/new`}
                className="inline-block bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                İlan Oluştur
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
