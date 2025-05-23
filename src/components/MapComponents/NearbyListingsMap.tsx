'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css'; // Removed global import
import Link from 'next/link';
import Image from 'next/image';

// Helper function to generate a unique ID for the map
const generateUniqueId = () => `map_${Math.random().toString(36).substr(2, 9)}`;

// Component to handle map cleanup on unmount
function MapLifecycleManager() {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    // Force invalidate size to ensure proper rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => {
      // Explicitly remove the map when component unmounts
      if (map) {
        try {
          // Remove all event listeners before removing the map
          map.off();
          map.remove();
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
      }
    };
  }, [map]);
  
  return null;
}

// Function to clean up Leaflet map instances when needed
function cleanupLeafletMapInstances() {
  // Find all leaflet map containers and clean them up
  const containers = document.querySelectorAll('.leaflet-container');
  containers.forEach(container => {
    // @ts-ignore - accessing _leaflet_id which is added by Leaflet
    if (container && container._leaflet_id) {
      // @ts-ignore
      delete container._leaflet_id;
    }
  });
}

interface Listing {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
  address: string;
  imagePath?: string;
}

interface NearbyListingsMapProps {
  center: [number, number];
  latitude: number;
  longitude: number;
  listings: Listing[];
  locale: string;
}

export default function NearbyListingsMap({
  center,
  latitude,
  longitude,
  listings,
  locale
}: NearbyListingsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [defaultIcon, setDefaultIcon] = useState<any>(null);
  const [divIcons, setDivIcons] = useState<Record<string, any>>({});
  // Create a stable map ID that won't change on re-renders
  const mapIdRef = useRef<string>(generateUniqueId());
  
  useEffect(() => {
    // Clean up any existing Leaflet map containers before mounting
    cleanupLeafletMapInstances();
    
    setIsMounted(true);
    
    // Import Leaflet only on client side
    const L = require('leaflet');
    
    // Create default icon
    const icon = L.icon({
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    setDefaultIcon(icon);
    
    // Create div icons for listings
    const icons: Record<string, any> = {};
    listings.forEach(listing => {
      icons[listing.id] = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background-color: #3B82F6; color: white; border-radius: 20px; padding: 4px 8px; font-size: 12px; font-weight: bold;">
            ${listing.price}₺
          </div>
        `,
        iconSize: [40, 20],
        iconAnchor: [20, 10],
      });
    });
    
    setDivIcons(icons);

    // Clean up function for when component unmounts
    return () => {
      cleanupLeafletMapInstances();
    };
  }, [listings]);
  
  // Return a consistent placeholder during server-side rendering and initialization
  if (!isMounted || !defaultIcon) {
    return (
      <div 
        className="h-full w-full bg-gray-100 rounded-lg"
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        {isMounted && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        )}
      </div>
    );
  }

  return (
    <MapContainer
      key={mapIdRef.current}
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      id={`map-${mapIdRef.current}`}
    >
      {/* Component to handle map cleanup on unmount */}
      <MapLifecycleManager />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Current listing marker (different color) */}
      <Marker 
        position={[latitude, longitude]} 
        icon={defaultIcon}
      >
        <Popup>
          <div className="text-center font-medium">
            Şu anki konum
          </div>
        </Popup>
      </Marker>
      
      {/* Nearby listings markers */}
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.latitude, listing.longitude]}
          icon={divIcons[listing.id] || defaultIcon}
        >
          <Popup>
            <div className="w-48">
              <Link 
                href={`/${locale}/listings/${listing.id}`} 
                className="block hover:opacity-90 transition-opacity"
              >
                <div className="relative h-24 rounded overflow-hidden mb-2">
                  <Image
                    src={listing.imagePath || '/images/marker-icon.png'}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm truncate">{listing.title}</h3>
                <p className="text-blue-600 font-bold">{listing.price}₺ / gece</p>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 