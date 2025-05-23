'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';

// Dynamically import Leaflet components with no SSR
const MapWithNoSSR = dynamic(
  () => import('./MapComponents/LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full border border-gray-300 rounded-lg bg-gray-100 animate-pulse flex items-center justify-center text-gray-500">
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

// Default center for the map (Istanbul)
const DEFAULT_CENTER: [number, number] = [41.0082, 28.9784];

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  onLocationChange: (latitude: number, longitude: number, address: string) => void;
  className?: string;
}

export default function LocationPicker({ 
  initialLatitude, 
  initialLongitude,
  initialAddress = '', 
  onLocationChange,
  className = 'h-64 w-full'
}: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress);
  const [mapPosition, setMapPosition] = useState<[number, number]>(
    initialLatitude && initialLongitude && initialLatitude !== 0 && initialLongitude !== 0
      ? [initialLatitude, initialLongitude]
      : DEFAULT_CENTER
  );
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserEditingAddress, setIsUserEditingAddress] = useState(false);

  console.log('[LocationPicker] Rendering. Initial Address:', initialAddress, 'Initial Coords:', initialLatitude, initialLongitude);

  // Effect to handle initial setup from props
  useEffect(() => {
    if (initialLatitude && initialLongitude && initialLatitude !== 0 && initialLongitude !== 0) {
      setMapPosition([initialLatitude, initialLongitude]);
    }
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialLatitude, initialLongitude, initialAddress]);

  // Reverse geocode: get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (isUserEditingAddress) {
      console.log('[LocationPicker] Skipping reverse geocode while user is editing');
      return;
    }
    
    if ((lat === DEFAULT_CENTER[0] && lng === DEFAULT_CENTER[1] && address) || (lat === 0 && lng === 0 && address)) {
        return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (!response.ok) throw new Error('Geocoding service unavailable');
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      // Potentially set an error state for the user here
    }
  }, [address, isUserEditingAddress]);

  // Effect to perform reverse geocoding when mapPosition changes
  useEffect(() => {
    if (mapPosition[0] !== 0 && mapPosition[1] !== 0) {
      if ((!address || (initialAddress && address === initialAddress)) && !isUserEditingAddress) {
         reverseGeocode(mapPosition[0], mapPosition[1]);
      }
    }
  }, [mapPosition, initialAddress, address, reverseGeocode, isUserEditingAddress]);

  // Update parent component when location changes (mapPosition or address)
  useEffect(() => {
    if (mapPosition[0] !== 0 && mapPosition[1] !== 0 && !isUserEditingAddress) {
        onLocationChange(mapPosition[0], mapPosition[1], address);
    }
  }, [mapPosition, address, onLocationChange, isUserEditingAddress]);

  // Enhanced address search with debounce
  const searchAddressSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    console.log('[LocationPicker] Searching for address:', query);
    setIsSearching(true);
    setError(null);
    try {
      // Make the query more specific for Turkey/Türkiye to improve results
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&countrycodes=tr`
      );
      
      if (!response.ok) throw new Error('Search service unavailable');
      
      const data = await response.json();
      console.log('[LocationPicker] Address search results:', data.length, data);
      
      if (data.length > 0) {
        setAddressSuggestions(data);
      } else {
        setError('Sonuç bulunamadı. Lütfen aramanızı değiştirin.');
      }
    } catch (err) {
      setError('Address search service is unavailable');
      console.error('Address search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []); // No dependencies to avoid re-creating this function
  
  // Update suggestions when address input changes by user
  useEffect(() => {
    if (isUserEditingAddress && address && address.length >= 3) {
      console.log('[LocationPicker] Address changed in effect, triggering search:', address);
      searchAddressSuggestions(address);
    } else if (!address || address.length < 3) {
      setAddressSuggestions([]);
    }
  }, [address, isUserEditingAddress, searchAddressSuggestions]);
  
  // Debug render of suggestions
  useEffect(() => {
    console.log('[LocationPicker] Current suggestions count:', addressSuggestions.length, 
                'isSearching:', isSearching, 
                'isUserEditing:', isUserEditingAddress);
    if (addressSuggestions.length > 0) {
      console.log('[LocationPicker] First suggestion:', addressSuggestions[0]);
    }
  }, [addressSuggestions, isSearching, isUserEditingAddress]);
  
  // Manual search function (when user clicks search button)
  const searchAddress = async () => {
    if (!address.trim()) {
      setError('Lütfen bir adres girin');
      return;
    }
    
    // Clear any existing suggestions first
    setAddressSuggestions([]);
    setIsSearching(true);
    setError(null);
    
    try {
      console.log('[LocationPicker] Manual search for:', address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=10&countrycodes=tr`
      );
      
      if (!response.ok) throw new Error('Search service unavailable');
      
      const data = await response.json();
      console.log('[LocationPicker] Manual search results:', data.length, data);
      
      if (data && data.length > 0) {
        // Show all results as suggestions
        setAddressSuggestions(data);
      } else {
        setError('Adres bulunamadı, lütfen daha spesifik bir adres girin veya haritadan konum seçin');
      }
    } catch (err) {
      setError('Adres arama sırasında bir hata oluştu');
      console.error('Address search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change by user
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUserEditingAddress(true);
    setAddress(e.target.value);
    
    // Clear errors when typing
    if (error) setError(null);
    
    // Trigger search directly for immediate feedback
    if (e.target.value.length >= 3) {
      // Use the non-debounced version for direct response
      searchAddressSuggestions(e.target.value);
    } else {
      setAddressSuggestions([]);
    }
  };

  // Handle when user stops editing the input
  const handleAddressBlur = () => {
    setTimeout(() => {
      setIsUserEditingAddress(false);
    }, 500);
  };

  // Select a suggestion and update the form
  const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
    console.log('[LocationPicker] Selected suggestion:', suggestion);
    setAddress(suggestion.display_name);
    const newPosition: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    setMapPosition(newPosition);
    setAddressSuggestions([]);
    // Set editing to false immediately after selection
    setIsUserEditingAddress(false);
    
    // Directly trigger the onLocationChange to ensure parent components are updated
    onLocationChange(parseFloat(suggestion.lat), parseFloat(suggestion.lon), suggestion.display_name);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          onFocus={() => setIsUserEditingAddress(true)}
          onBlur={handleAddressBlur}
          placeholder="Adresi girin veya haritadan seçin"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        
        {isSearching && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        <button
          type="button"
          onClick={searchAddress}
          className="absolute right-0 top-0 h-full px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        {/* Suggestions dropdown - Force render if we have suggestions */}
        {addressSuggestions.length > 0 ? (
          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto" 
               style={{display: 'block', pointerEvents: 'auto'}}>
            <div className="py-1 px-2 text-xs text-gray-500 border-b border-gray-100">
              {addressSuggestions.length} sonuç bulundu
            </div>
            {addressSuggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => selectAddressSuggestion(suggestion)}
                className="block w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm truncate border-b border-gray-100"
              >
                {suggestion.display_name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
        <MapWithNoSSR 
          center={mapPosition}
          position={mapPosition}
          setPosition={setMapPosition}
        />
      </div>
      
      {mapPosition[0] !== 0 && mapPosition[1] !== 0 && mapPosition !== DEFAULT_CENTER && (
        <div className="p-2 bg-green-50 border border-green-100 rounded-md text-sm text-green-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Konum seçildi: {mapPosition[0].toFixed(6)}, {mapPosition[1].toFixed(6)}
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Haritada istediğiniz noktaya tıklayarak veya yukarıdaki arama kutusunu kullanarak konum seçebilirsiniz.
      </p>
    </div>
  );
} 