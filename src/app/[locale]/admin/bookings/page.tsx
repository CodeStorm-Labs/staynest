'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminGuard from '@/components/core/AdminGuard';

interface Booking {
  id: string;
  listingId: string;
  userId: string;
  totalPrice: number;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  createdAt: string;
  listingTitle?: string;
  userName?: string;
}

export default function AdminBookingsPage() {
  const { locale } = useParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const bookingsPerPage = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Filter and search bookings
  const filteredBookings = (bookings || []).filter(booking => {
    // Handle cases where these might be undefined
    const listingTitle = booking.listingTitle || '';
    const userName = booking.userName || '';
    
    const matchesSearch = (
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'confirmed') return matchesSearch && booking.status === 'CONFIRMED';
    if (filter === 'pending') return matchesSearch && booking.status === 'PENDING';
    if (filter === 'cancelled') return matchesSearch && booking.status === 'CANCELLED';
    
    return matchesSearch;
  });

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = (filteredBookings || []).slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil((filteredBookings?.length || 0) / bookingsPerPage);

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'cancel') => {
    if (!confirm(`Bu rezervasyon için ${action === 'confirm' ? 'onaylama' : 'iptal'} işlemini onaylıyor musunuz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
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

      // Update the bookings state based on the action
      setBookings((prevBookings) => (prevBookings || []).map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: action === 'confirm' ? 'CONFIRMED' : 'CANCELLED' } 
          : booking
      ));
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Rezervasyon Yönetimi</h1>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rezervasyonları ara..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-black"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
          >
            <option value="all">Tüm Rezervasyonlar</option>
            <option value="confirmed">Onaylanmış</option>
            <option value="pending">Onay Bekliyor</option>
            <option value="cancelled">İptal Edilmiş</option>
          </select>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Rezervasyon ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    İlan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Tarihler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBookings.length > 0 ? (
                  currentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{booking.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{booking.userName || booking.userId.slice(0, 8) + '...'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{booking.listingTitle || booking.listingId.slice(0, 8) + '...'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        <div>{formatDate(booking.checkIn)}</div>
                        <div>- {formatDate(booking.checkOut)}</div>
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
                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirm')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'cancel')}
                                className="text-red-600 hover:text-red-900"
                              >
                                İptal Et
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-black">
                      Rezervasyon bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredBookings.length > bookingsPerPage && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-black">
                  <span className="font-medium">{indexOfFirstBooking + 1}</span> - 
                  <span className="font-medium">
                    {Math.min(indexOfLastBooking, filteredBookings.length)}
                  </span> / 
                  <span className="font-medium">{filteredBookings.length}</span> rezervasyon
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Önceki
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
} 