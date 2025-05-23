'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

// Define the interface for the dynamically imported component's props
interface NearbyListingsMapProps {
  center: [number, number];
  latitude: number;
  longitude: number;
  listings: Listing[];
  locale: string;
}

// Dynamically import Leaflet components with no SSR
const MapWithNoSSR = dynamic<NearbyListingsMapProps>(
  () => import('@/components/MapComponents/NearbyListingsMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-900">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Yakındaki ilanlar yükleniyor...
        </div>
      </div>
    )
  }
);

interface Listing {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
  address: string;
  imagePath?: string;
}

interface NearbyListingsProps {
  currentListingId: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  className?: string;
}

export default function NearbyListings({
  currentListingId,
  latitude,
  longitude,
  distanceKm = 5,
  className = 'h-96 w-full'
}: NearbyListingsProps) {
  const { locale } = useParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNearbyListings() {
      try {
        setLoading(true);
        // Convert distance to degrees for approximately calculating nearby listings
        // Very rough approximation: 1 degree = 111km at the equator
        const distanceDegrees = distanceKm / 111;
        
        const response = await fetch(`/api/listings/nearby?lat=${latitude}&lng=${longitude}&distance=${distanceDegrees}&exclude=${currentListingId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch nearby listings');
        }
        
        const data = await response.json();
        setListings(data);
      } catch (err) {
        console.error('Error fetching nearby listings:', err);
        setError('Yakındaki ilanlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    if (latitude && longitude) {
      fetchNearbyListings();
    }
  }, [latitude, longitude, distanceKm, currentListingId]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center text-gray-900`}>
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Yakındaki ilanlar yükleniyor...
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>;
  }

  if (listings.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-900">Bu bölgede yakın başka ilan bulunamadı.</p>
      </div>
    );
  }

  // Calculate map bounds to fit all listings
  const center: [number, number] = [latitude, longitude];

  return (
    <div className="space-y-4">
      {/* List of nearby listings with enhanced contrast */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {listings.map(listing => (
            <Link
              key={listing.id}
              href={`/${locale}/listings/${listing.id}`}
              className="flex items-center p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-lg hover:border-transparent transition-all"
            >
              <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={listing.imagePath || '/images/marker-icon.png'}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <h3 className="font-semibold text-base text-gray-800 truncate">{listing.title}</h3>
                <p className="text-gray-900 text-sm truncate">{listing.address}</p>
                <p className="text-blue-600 font-semibold text-sm">{listing.price}₺ / gece</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 