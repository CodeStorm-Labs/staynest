'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import AdminGuard from '@/components/core/AdminGuard';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Listing {
  id: string;
  title: string;
  userId: string;
  price: number;
  status: string;
}

interface Booking {
  id: string;
  listingId: string;
  userId: string;
  totalPrice: number;
  status: string;
}

export default function AdminDashboard() {
  const { locale } = useParams();
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'bookings'>('users');
  const router = useRouter();

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch listings data
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/admin/listings', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, []);

  // Fetch bookings data
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/admin/bookings', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      // Also clear the admin_session cookie
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error('Error occurred during logout:', error);
    }
  };

  const handleUserAction = async (userId: string, action: 'delete' | 'makeAdmin' | 'removeAdmin') => {
    if (!confirm(`Bu kullanıcı için ${action} işlemini onaylıyor musunuz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Update the users state based on the action
      if (action === 'delete') {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, role: action === 'makeAdmin' ? 'admin' : 'user' } 
            : user
        ));
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const handleListingAction = async (listingId: string, action: 'delete' | 'approve' | 'reject') => {
    if (!confirm(`Bu ilan için ${action} işlemini onaylıyor musunuz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Update the listings state based on the action
      if (action === 'delete') {
        setListings(listings.filter(listing => listing.id !== listingId));
      } else {
        setListings(listings.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: action === 'approve' ? 'ACTIVE' : 'REJECTED' } 
            : listing
        ));
      }
    } catch (error) {
      console.error(`Failed to ${action} listing:`, error);
    }
  };

  return (
    <AdminGuard>
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="container mx-auto px-4 py-10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black border-b pb-2 border-gray-200">Yönetici Paneli</h1>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 font-medium"
            >
              Çıkış Yap
            </button>
          </div>

          {/* Admin Stats */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black font-medium">Toplam Kullanıcı</p>
                  <p className="text-3xl font-bold text-black">{users.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black font-medium">Toplam İlan</p>
                  <p className="text-3xl font-bold text-black">{listings.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black font-medium">Toplam Rezervasyon</p>
                  <p className="text-3xl font-bold text-black">{bookings.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 text-sm font-medium ${
                  activeTab === 'users'
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-black hover:text-red-600'
                }`}
              >
                Kullanıcılar
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 text-sm font-medium ${
                  activeTab === 'listings'
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-black hover:text-red-600'
                }`}
              >
                İlanlar
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 text-sm font-medium ${
                  activeTab === 'bookings'
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-black hover:text-red-600'
                }`}
              >
                Rezervasyonlar
              </button>
            </div>
          </div>

          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {loadingUsers ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-black">Kullanıcılar yükleniyor...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          E-posta
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Rol
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Kayıt Tarihi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold">
                                  {user.name.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-black">{user.name}</div>
                                <div className="text-sm text-black">ID: {user.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'makeAdmin')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Admin Yap
                                </button>
                              )}
                              {user.role === 'admin' && user.email !== 'admin@example.com' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'removeAdmin')}
                                  className="text-orange-600 hover:text-orange-900"
                                >
                                  Admin Kaldır
                                </button>
                              )}
                              {user.email !== 'admin@example.com' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'delete')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Sil
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Listings Tab Content */}
          {activeTab === 'listings' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {loadingListings ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-black">İlanlar yükleniyor...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          İlan Başlığı
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Sahip
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Fiyat
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
                      {listings.map((listing) => (
                        <tr key={listing.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-black">{listing.title}</div>
                            <div className="text-sm text-black">ID: {listing.id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black">{listing.userId.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {listing.price}₺ / gece
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {listing.status === 'ACTIVE' ? 'Aktif' :
                               listing.status === 'PENDING' ? 'Onay Bekliyor' :
                               'Reddedildi'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <Link
                                href={`/${locale}/listings/${listing.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Görüntüle
                              </Link>
                              {listing.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleListingAction(listing.id, 'approve')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Onayla
                                  </button>
                                  <button
                                    onClick={() => handleListingAction(listing.id, 'reject')}
                                    className="text-orange-600 hover:text-orange-900"
                                  >
                                    Reddet
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleListingAction(listing.id, 'delete')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab Content */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {loadingBookings ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-black">Rezervasyonlar yükleniyor...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Rezervasyon ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                          İlan
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
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black">{booking.id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black">{booking.userId.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black">{booking.listingId.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {booking.totalPrice}₺
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status === 'CONFIRMED' ? 'Onaylandı' :
                               booking.status === 'PENDING' ? 'Onay Bekliyor' :
                               'İptal Edildi'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <Link
                                href={`/${locale}/listings/${booking.listingId}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                İlanı Görüntüle
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
} 