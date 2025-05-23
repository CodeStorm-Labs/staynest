'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SearchFiltersProps {
  locale: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function SearchFilters({ locale, minPrice = 0, maxPrice = 5000 }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get current query parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') as string) : minPrice,
    max: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') as string) : maxPrice,
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'price_asc');
  
  // Create a query string from the current filters
  const createQueryString = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove search query
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    
    // Update or remove property type
    if (propertyType) {
      params.set('type', propertyType);
    } else {
      params.delete('type');
    }
    
    // Update price range
    if (priceRange.min !== minPrice) {
      params.set('minPrice', priceRange.min.toString());
    } else {
      params.delete('minPrice');
    }
    
    if (priceRange.max !== maxPrice) {
      params.set('maxPrice', priceRange.max.toString());
    } else {
      params.delete('maxPrice');
    }
    
    // Update sort by
    if (sortBy) {
      params.set('sortBy', sortBy);
    } else {
      params.delete('sortBy');
    }
    
    return params.toString();
  };
  
  const handleSearch = () => {
    const queryString = createQueryString();
    router.push(`${pathname}?${queryString}`);
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setPropertyType('');
    setPriceRange({ min: minPrice, max: maxPrice });
    setSortBy('price_asc');
    router.push(pathname);
  };
  
  // Debounce function to delay price filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        priceRange.min !== (searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') as string) : minPrice) ||
        priceRange.max !== (searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') as string) : maxPrice)
      ) {
        handleSearch();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [priceRange]);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <div className="space-y-6">
        {/* Search input */}
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Konum, başlık veya açıklama ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10 text-black placeholder-black"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 right-0 px-4 text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none"
            >
              Ara
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Type Filter */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Konut Tipi</label>
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                setTimeout(handleSearch, 0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">Tümü</option>
              <option value="APARTMENT">Daire</option>
              <option value="HOUSE">Ev</option>
              <option value="UNIQUE">Özel</option>
              <option value="HOTEL">Otel</option>
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Fiyat Aralığı: {priceRange.min}₺ - {priceRange.max}₺
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  min={minPrice}
                  max={priceRange.max}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-black"
                  placeholder="Min"
                />
              </div>
              <div>
                <input
                  type="number"
                  min={priceRange.min}
                  max={maxPrice}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-black"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Sıralama</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setTimeout(handleSearch, 0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="price_asc">Fiyat (Artan)</option>
              <option value="price_desc">Fiyat (Azalan)</option>
              <option value="newest">En Yeni</option>
            </select>
          </div>
        </div>
        
        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="text-sm text-black hover:text-gray-900 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Filtreleri Temizle
          </button>
        </div>
      </div>
    </div>
  );
} 