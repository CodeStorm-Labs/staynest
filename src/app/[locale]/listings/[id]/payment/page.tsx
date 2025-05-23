'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import PaymentForm from '@/components/PaymentForm';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Listing {
  id: string;
  title: string;
  price: number;
  address: string;
}

export default function PaymentPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get booking details from URL parameters
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');

  const checkIn = checkInParam ? new Date(checkInParam) : null;
  const checkOut = checkOutParam ? new Date(checkOutParam) : null;
  const guests = guestsParam ? parseInt(guestsParam) : 1;

  useEffect(() => {
    // Validate required parameters
    if (!checkIn || !checkOut || !guests) {
      setError('Eksik rezervasyon bilgileri. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    // Fetch listing details
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${id}`);
        if (!response.ok) {
          throw new Error('İlan bulunamadı');
        }
        const data = await response.json();
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, checkIn, checkOut, guests]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !listing || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hata</h2>
          <p className="text-gray-600 mb-4">{error || 'Beklenmeyen bir hata oluştu'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Rezervasyonu Tamamla</h1>
          <p className="text-gray-600 mt-2">
            {format(checkIn, 'dd MMMM yyyy', { locale: tr })} - {format(checkOut, 'dd MMMM yyyy', { locale: tr })} • {guests} misafir
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listing Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rezervasyon Detayları</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{listing.title}</h3>
                <p className="text-gray-600">{listing.address}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gecelik fiyat:</span>
                  <span className="font-semibold">{listing.price}₺</span>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Önemli Bilgiler</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ödeme güvenli şekilde Stripe ile işlenir</li>
                  <li>• Rezervasyon onayı anında gerçekleşir</li>
                  <li>• İptal politikası için ev sahibi ile iletişime geçin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <PaymentForm
            listingId={listing.id}
            listingTitle={listing.title}
            listingPrice={listing.price}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
          />
        </div>
      </div>
    </div>
  );
} 