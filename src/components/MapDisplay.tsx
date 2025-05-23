'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components with no SSR
const MapWithNoSSR = dynamic(
  () => import('./MapComponents/DisplayMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-500">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Harita yükleniyor...
        </div>
      </div>
    )
  }
);

interface POI {
  name: string;
  category: string;
  distance: string;
  latitude: number;
  longitude: number;
}

interface MarkerData {
  latitude: number;
  longitude: number;
  popupText?: string;
}

interface MapDisplayProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  popupText?: string;
  className?: string;
  markers?: MarkerData[];
  showPOIs?: boolean;
}

export default function MapDisplay({
  latitude,
  longitude,
  zoom = 14,
  popupText,
  className = 'h-96 w-full rounded-lg shadow-md',
  markers,
  showPOIs = false,
}: MapDisplayProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [nearbyPOIs, setNearbyPOIs] = useState<POI[]>([]);

  useEffect(() => {
    setHasMounted(true);

    // Simulate fetching nearby points of interest
    // In a real app, you'd call an API like OpenStreetMap Overpass or Google Places
    if (showPOIs && latitude && longitude) {
      // Mock data for nearby POIs
      const mockPOIs: POI[] = [
        {
          name: 'Merkez Cafe',
          category: 'cafe',
          distance: '250m',
          latitude: latitude + 0.001,
          longitude: longitude + 0.001,
        },
        {
          name: 'Park Market',
          category: 'grocery',
          distance: '400m',
          latitude: latitude - 0.001,
          longitude: longitude + 0.0008,
        },
        {
          name: 'Mavi Metro İstasyonu',
          category: 'transit',
          distance: '600m',
          latitude: latitude + 0.002,
          longitude: longitude - 0.001,
        },
      ];
      
      setNearbyPOIs(mockPOIs);
    }
  }, [latitude, longitude, showPOIs]);

  if (!hasMounted) {
    return <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center text-gray-500`}>
      <div className="flex items-center">
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Harita yükleniyor...
      </div>
    </div>;
  }

  // Calculate center point for multiple markers
  let center: [number, number] = [41.0082, 28.9784]; // Default: Istanbul
  
  if (latitude && longitude) {
    // If single marker coordinates provided
    center = [latitude, longitude];
  } else if (markers && markers.length > 0) {
    // Calculate average of all markers
    const totalLat = markers.reduce((sum, marker) => sum + marker.latitude, 0);
    const totalLng = markers.reduce((sum, marker) => sum + marker.longitude, 0);
    center = [totalLat / markers.length, totalLng / markers.length];
  }

  return (
    <div className="space-y-2">
      <MapWithNoSSR 
        center={center}
        zoom={zoom}
        className={className}
        latitude={latitude}
        longitude={longitude}
        markers={markers}
        popupText={popupText}
        nearbyPOIs={nearbyPOIs}
        showPOIs={showPOIs}
      />
      
      {/* POI list below map */}
      {showPOIs && nearbyPOIs.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium mb-2">Yakın Çevrede</h3>
          <ul className="space-y-2">
            {nearbyPOIs.map((poi, index) => (
              <li key={index} className="flex items-center text-sm">
                <span className={`h-2 w-2 rounded-full mr-2 ${
                  poi.category === 'cafe' ? 'bg-purple-500' : 
                  poi.category === 'grocery' ? 'bg-green-500' : 
                  poi.category === 'transit' ? 'bg-blue-500' : 
                  'bg-gray-500'
                }`}></span>
                <span className="font-medium">{poi.name}</span>
                <span className="mx-1.5 text-gray-300">•</span>
                <span className="text-gray-500">{poi.distance}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 