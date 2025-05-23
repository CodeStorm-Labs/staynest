'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminGuard from '@/components/core/AdminGuard';

interface Listing {
  id: string;
  title: string;
  userId: string;
  price: number;
  status: string;
  address: string;
  createdAt: string;
  propertyType: string;
}

export default function AdminListingsPage() {
  const { locale } = useParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const listingsPerPage = 10;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter and search listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch = (
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.propertyType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && listing.status === 'ACTIVE';
    if (filter === 'pending') return matchesSearch && listing.status === 'PENDING';
    if (filter === 'rejected') return matchesSearch && listing.status === 'REJECTED';
    
    return matchesSearch;
  });

  // Pagination
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = filteredListings.slice(indexOfFirstListing, indexOfLastListing);
  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);

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
          <h1 className="text-3xl font-bold text-black">İlan Yönetimi</h1>
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
              placeholder="İlanları ara..."
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
            <option value="all">Tüm İlanlar</option>
            <option value="active">Aktif</option>
            <option value="pending">Onay Bekliyor</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    İlan Başlığı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Adres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Tür
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
                {currentListings.length > 0 ? (
                  currentListings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-black">{listing.title}</div>
                        <div className="text-sm text-black">ID: {listing.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{listing.address || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {listing.price}₺ / gece
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{listing.propertyType || 'N/A'}</div>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-black">
                      İlan bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredListings.length > listingsPerPage && (
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-black">
                  <span className="font-medium">{indexOfFirstListing + 1}</span> - 
                  <span className="font-medium">
                    {Math.min(indexOfLastListing, filteredListings.length)}
                  </span> / 
                  <span className="font-medium">{filteredListings.length}</span> ilan
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