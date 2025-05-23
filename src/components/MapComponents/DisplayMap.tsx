'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle, useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';

// Helper function to generate a unique ID for the map
const generateUniqueId = () => `map_${Math.random().toString(36).substr(2, 9)}`;

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

interface DisplayMapProps {
  center: [number, number];
  zoom: number;
  className?: string;
  latitude?: number;
  longitude?: number;
  markers?: MarkerData[];
  popupText?: string;
  nearbyPOIs?: POI[];
  showPOIs?: boolean;
}

export default function DisplayMap({
  center,
  zoom,
  className = 'h-96 w-full rounded-lg shadow-md',
  latitude,
  longitude,
  markers,
  popupText,
  nearbyPOIs = [],
  showPOIs = false,
}: DisplayMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);
  const [poiIcons, setPoiIcons] = useState<Record<string, any>>({});
  // Create a stable map ID that won't change on re-renders
  const mapIdRef = useRef<string>(generateUniqueId());
  
  // Use a ref to track if cleanup has been performed
  const cleanupPerformedRef = useRef(false);
  
  // Map initialization handler - moved up before any conditional returns to maintain hook order
  const handleMapReady = useCallback(() => {
    // Reference to mounted Leaflet maps in DOM
    const mapElements = document.querySelectorAll('.leaflet-container');
    if (mapElements.length > 0) {
      // The last map element is our map
      const mapElement = mapElements[mapElements.length - 1];
      // @ts-ignore
      if (mapElement._leaflet && mapElement._leaflet.map) {
        // @ts-ignore
        const map = mapElement._leaflet.map;
        // Force a redraw after creation
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    }
  }, []);
  
  useEffect(() => {
    // Ensure we only run the cleanup once per component instance
    if (!cleanupPerformedRef.current) {
      cleanupLeafletMapInstances();
      cleanupPerformedRef.current = true;
    }
    
    setIsMounted(true);
    
    // Import Leaflet only on client side
    const L = require('leaflet');
    
    // Fix for default marker icon issue with webpack
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;

    // Set custom marker icon
    const icon = new L.Icon({
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    setCustomIcon(icon);
    
    // Initialize POI icons
    const poiIconTypes: Record<string, any> = {};
    ['cafe', 'grocery', 'transit'].forEach(category => {
      const color = 
        category === 'cafe' ? '#8B5CF6' : 
        category === 'grocery' ? '#10B981' : 
        category === 'transit' ? '#3B82F6' : 
        '#6B7280';

      poiIconTypes[category] = new L.Icon({
        iconUrl: '/images/marker-icon.png',
        shadowUrl: '/images/marker-shadow.png',
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [1, -34],
        shadowSize: [32, 32],
        className: `poi-icon-${category}`
      });
    });
    
    setPoiIcons(poiIconTypes);

    // Clean up function for when component unmounts
    return () => {
      cleanupLeafletMapInstances();
    };
  }, []);

  // Return a consistent placeholder during server-side rendering and initialization
  if (!isMounted || !customIcon) {
    return (
      <div 
        className={className} 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem'
        }}
      >
        {isMounted && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        )}
      </div>
    );
  }

  // Get POI icon for a given category
  const getPoiIcon = (category: string) => {
    return poiIcons[category] || customIcon;
  };

  return (
    <MapContainer
      key={mapIdRef.current}
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={className}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      whenReady={handleMapReady}
      id={`map-${mapIdRef.current}`}
    >
      {/* Component to handle map cleanup on unmount */}
      <MapLifecycleManager />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <ZoomControl position="bottomright" />
      
      {/* Location radius indicator */}
      {latitude && longitude && (
        <Circle 
          center={[latitude, longitude]} 
          radius={150}
          pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, weight: 1, color: 'blue' }}
        />
      )}
      
      {/* Single marker mode */}
      {latitude && longitude && (
        <Marker position={[latitude, longitude]} icon={customIcon}>
          {popupText && (
            <Popup>
              <div className="text-center">
                <strong>{popupText}</strong>
              </div>
            </Popup>
          )}
        </Marker>
      )}
      
      {/* Multiple markers mode */}
      {markers && markers.map((marker, index) => (
        <Marker key={index} position={[marker.latitude, marker.longitude]} icon={customIcon}>
          {marker.popupText && (
            <Popup>
              <div className="text-center">
                <strong>{marker.popupText}</strong>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
      
      {/* POI markers */}
      {showPOIs && nearbyPOIs.map((poi, index) => (
        <Marker 
          key={`poi-${index}`} 
          position={[poi.latitude, poi.longitude]} 
          icon={getPoiIcon(poi.category)}
        >
          <Popup>
            <div className="text-sm">
              <strong>{poi.name}</strong>
              <p className="text-gray-600">{poi.category} • {poi.distance}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 