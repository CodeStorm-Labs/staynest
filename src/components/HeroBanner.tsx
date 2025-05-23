'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function HeroBanner() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const params = useParams();
  const locale = (params as any).locale || 'tr';

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (query) {
      router.push(`/${locale}/listings?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/${locale}/listings`);
    }
  };

  return (
    <div className="relative h-[70vh] w-full" style={{ backgroundColor: 'blue' }}>
      {/* First test with a simple color to verify layout */}
      <div className="relative h-full w-full flex items-center justify-center">
        <Image 
          src="https://picsum.photos/2000/1000"
          alt="Banner background" 
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Hayalinizdeki Konaklamayı Keşfedin</h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">Türkiye'nin dört bir yanındaki eşsiz konaklama yerlerini keşfedin ve unutulmaz anılar biriktirin.</p>
          <div className="w-full max-w-xl mx-auto bg-white rounded-full p-2 flex items-center shadow-lg">
            <input
              type="text"
              placeholder="Nereye gitmek istersiniz?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent px-6 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-full"
            />
            <button
              onClick={handleSearch}
              className="ml-2 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300 font-semibold"
            >
              Ara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 