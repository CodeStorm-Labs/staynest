'use client';

import { useEffect, useState, useRef } from 'react';
// Remove react-leaflet imports
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type L from 'leaflet';

// Helper function to generate a unique ID for the map
const generateUniqueId = () => `map_${Math.random().toString(36).substr(2, 9)}`;

interface LocationPickerMapProps {
  center: [number, number];
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}

export default function LocationPickerMap({ center, position, setPosition }: LocationPickerMapProps) {
  // Track if we're on client side
  const [isMounted, setIsMounted] = useState(false);
  const [defaultIcon, setDefaultIcon] = useState<any>(null);
  
  // Create a stable map ID that won't change on re-renders
  const [mapId] = useState(() => generateUniqueId());
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  console.log('[LocationPickerMap] Rendering - isMounted:', isMounted, 'defaultIcon set:', !!defaultIcon);

  // Handle client-side initialization
  useEffect(() => {
    console.log('[LocationPickerMap] useEffect - Mount');
    setIsMounted(true);
    
    // Only import and initialize Leaflet on the client
    try {
      const L = require('leaflet');
      
      // Fix Leaflet default icon issue in Next.js
      const icon = L.icon({
        iconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Set default icon for all markers
      L.Marker.prototype.options.icon = icon;
      setDefaultIcon(icon);

      // Get the container element
      const mapContainer = document.getElementById(mapId);
      if (!mapContainer) {
        console.error('[LocationPickerMap] Map container element not found');
        return;
      }

      // Check if there's already a map instance on this container (could happen with Fast Refresh)
      if ((mapContainer as any)._leaflet_id) {
        console.log('[LocationPickerMap] Container already has _leaflet_id, cleaning up first');
        delete (mapContainer as any)._leaflet_id;
      }

      // Create the map instance
      const map = L.map(mapContainer, {
        center: center,
        zoom: 13,
        scrollWheelZoom: true,
        keyboard: false, // Disable keyboard navigation for the map
        zoomControl: true,
        attributionControl: true
      });

      // Disable global event handlers that might interfere with input elements
      map.keyboard.disable();
      
      // Add the map to our ref for later access
      mapInstanceRef.current = map;

      // Add the tile layer (equivalent to TileLayer in react-leaflet)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add click handler (equivalent to useMapEvents in react-leaflet)
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
      });

      // Add marker if position is valid
      if (position && position[0] !== 0 && position[1] !== 0) {
        if (markerRef.current) {
          markerRef.current.remove();
        }
        markerRef.current = L.marker(position, { icon }).addTo(map);
        map.flyTo(position, map.getZoom());
      }

      // Watch for position changes to update marker
      const watchPosition = () => {
        if (position && position[0] !== 0 && position[1] !== 0) {
          if (!markerRef.current) {
            markerRef.current = L.marker(position, { icon }).addTo(map);
          } else {
            markerRef.current.setLatLng(position);
          }
          map.flyTo(position, map.getZoom());
        }
      };

      // Need to track the position prop outside the effect
      map._lastPosition = position;
      const positionInterval = setInterval(() => {
        if (position !== map._lastPosition) {
          map._lastPosition = position;
          watchPosition();
        }
      }, 100);

      // Fire the ready event manually
      setTimeout(() => {
        console.log('[LocationPickerMap] Map initialization complete');
        // Invalidate the map size to ensure it renders correctly after all DOM elements are settled
        map.invalidateSize(true);
        
        // Additional forced refresh after a slightly longer delay
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize(true);
            console.log('[LocationPickerMap] Additional map size refresh completed');
          }
        }, 500);
      }, 100);

      // Cleanup function
      return () => {
        console.log('[LocationPickerMap] Cleanup - Removing map instance');
        clearInterval(positionInterval);
        
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          console.log('[LocationPickerMap] Map instance successfully removed');
        }
        
        // Aggressive cleanup of the DOM element
        const container = document.getElementById(mapId);
        if (container && (container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
          console.log('[LocationPickerMap] Aggressively cleaned _leaflet_id from container');
        }
      };
    } catch (error) {
      console.error('[LocationPickerMap] Error initializing map:', error);
    }
  }, [mapId, center]); // Only re-initialize if mapId or center changes

  // Update marker when position changes
  useEffect(() => {
    if (!isMounted || !mapInstanceRef.current) return;
    
    console.log('[LocationPickerMap] Position changed:', position);
    
    try {
      const L = require('leaflet');
      if (position && position[0] !== 0 && position[1] !== 0) {
        // Check if we need to reposition the map view (for significant position changes)
        const map = mapInstanceRef.current;
        const currentCenter = map.getCenter();
        const targetPosition = L.latLng(position[0], position[1]);
        
        // Calculate distance between current center and new position in meters
        const distance = currentCenter.distanceTo(targetPosition);
        console.log('[LocationPickerMap] Distance from current center:', distance, 'meters');
        
        // Update marker
        if (!markerRef.current) {
          console.log('[LocationPickerMap] Creating new marker');
          markerRef.current = L.marker(position, { icon: defaultIcon }).addTo(mapInstanceRef.current);
        } else {
          console.log('[LocationPickerMap] Updating marker position');
          markerRef.current.setLatLng(position);
        }
        
        // If position changed significantly (more than 500 meters), animate the map to the new position
        if (distance > 500) {
          console.log('[LocationPickerMap] Significant position change, flying to new position');
          map.flyTo(position, map.getZoom(), {
            animate: true,
            duration: 1.5
          });
        }
      }
    } catch (error) {
      console.error('[LocationPickerMap] Error updating position:', error);
    }
  }, [position, isMounted, defaultIcon]);

  // Return a consistent placeholder during server-side rendering
  // and while the map is initializing on the client
  if (!isMounted || !defaultIcon) {
    console.log('[LocationPickerMap] Showing spinner because !isMounted (', !isMounted, ') || !defaultIcon (', !defaultIcon, ')');
    return (
      <div 
        style={{ 
          height: '100%', 
          width: '100%', 
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isMounted && !defaultIcon && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        )}
        {!isMounted && <p>Waiting for mount...</p>} 
      </div>
    );
  }

  console.log('[LocationPickerMap] Rendering map container DIV');
  return (
    <div 
      id={mapId}
      style={{ 
        height: '100%', 
        width: '100%',
        position: 'relative',
        // Remove the z-index that might be causing issues
        // zIndex: 10 
      }}
      // Remove event handlers that might be interfering
      // onKeyDown={(e) => e.stopPropagation()}
      // onKeyPress={(e) => e.stopPropagation()}
      // onClick={(e) => e.stopPropagation()}
    />
  );
} 