'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Users, MapPin } from 'lucide-react';

export default function HeroSearch() {
  const [focused, setFocused] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(2);
  const [dateRange, setDateRange] = useState({
    checkIn: '',
    checkOut: '',
  });

  // Popular destinations in Turkey
  const popularDestinations = [
    'İstanbul', 'Antalya', 'Bodrum', 'Kapadokya', 'Fethiye',
    'İzmir', 'Marmaris', 'Alanya', 'Çeşme', 'Kuşadası'
  ];

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = popularDestinations.filter(dest => 
        dest.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', { location: searchQuery, dates: dateRange, guests: guestCount });
    
    // Would typically redirect to search results page
    // router.push(`/tr/listings?location=${searchQuery}&checkIn=${dateRange.checkIn}&checkOut=${dateRange.checkOut}&guests=${guestCount}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-full shadow-xl overflow-hidden max-w-4xl w-full mx-auto"
    >
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row">
        {/* Location search */}
        <div className="relative flex-1 border-b md:border-b-0 md:border-r border-gray-200">
          <div 
            className={`flex items-center px-6 py-4 ${focused === 'location' ? 'bg-blue-50' : ''}`}
            onClick={() => setFocused('location')}
          >
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <div className="flex-1">
              <label htmlFor="location" className="block text-sm font-medium text-black">Konum</label>
              <input
                id="location"
                type="text"
                placeholder="Nereye gitmek istiyorsunuz?"
                className="block w-full text-lg text-black border-none p-0 focus:ring-0 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setFocused('location')}
                onBlur={() => setTimeout(() => setFocused(null), 200)}
              />
            </div>
          </div>
          
          {/* Location suggestions */}
          <AnimatePresence>
            {focused === 'location' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 bg-white shadow-lg rounded-b-lg z-10 max-h-64 overflow-y-auto"
              >
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-black mb-2">Popüler Yerler</h3>
                  {suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            className="flex items-center w-full px-4 py-3 hover:bg-blue-50 rounded-lg text-black"
                            onClick={() => {
                              setSearchQuery(suggestion);
                              setFocused(null);
                            }}
                          >
                            <MapPin className="h-4 w-4 text-blue-600 mr-3" />
                            <span>{suggestion}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery.length > 1 ? (
                    <p className="text-black p-4">Sonuç bulunamadı</p>
                  ) : (
                    <ul>
                      {popularDestinations.slice(0, 5).map((destination, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            className="flex items-center w-full px-4 py-3 hover:bg-blue-50 rounded-lg text-black"
                            onClick={() => {
                              setSearchQuery(destination);
                              setFocused(null);
                            }}
                          >
                            <MapPin className="h-4 w-4 text-blue-600 mr-3" />
                            <span>{destination}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date picker */}
        <div className="relative flex-1 border-b md:border-b-0 md:border-r border-gray-200">
          <div 
            className={`flex items-center px-6 py-4 ${focused === 'dates' ? 'bg-blue-50' : ''}`}
            onClick={() => setFocused('dates')}
          >
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <div className="flex-1">
              <label htmlFor="dates" className="block text-sm font-medium text-black">Tarihler</label>
              <div className="flex items-center">
                <input
                  id="check-in"
                  type="date"
                  className="block w-full text-lg text-black border-none p-0 focus:ring-0 bg-transparent"
                  value={dateRange.checkIn}
                  onChange={(e) => setDateRange({...dateRange, checkIn: e.target.value})}
                  onFocus={() => setFocused('dates')}
                />
                <span className="mx-2 text-black">-</span>
                <input
                  id="check-out"
                  type="date"
                  className="block w-full text-lg text-black border-none p-0 focus:ring-0 bg-transparent"
                  value={dateRange.checkOut}
                  onChange={(e) => setDateRange({...dateRange, checkOut: e.target.value})}
                  onFocus={() => setFocused('dates')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Guest count */}
        <div className="relative flex-1 border-b md:border-b-0 md:border-r border-gray-200">
          <div 
            className={`flex items-center px-6 py-4 ${focused === 'guests' ? 'bg-blue-50' : ''}`}
            onClick={() => setFocused('guests')}
          >
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div className="flex-1">
              <label htmlFor="guests" className="block text-sm font-medium text-black">Misafirler</label>
              <select
                id="guests"
                className="block w-full text-lg text-black border-none p-0 focus:ring-0 bg-transparent"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value))}
                onFocus={() => setFocused('guests')}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Misafir' : 'Misafir'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search button */}
        <div className="py-2 px-4 md:p-0">
          <button
            type="submit"
            className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-full md:rounded-none flex items-center justify-center px-8 py-4 transition-colors"
          >
            <Search className="h-5 w-5 mr-2" />
            <span>Ara</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
} 