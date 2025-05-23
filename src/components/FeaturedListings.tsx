'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropertyCard from './PropertyCard';

// Sample data - would typically come from an API
const featuredProperties = [
  {
    id: '1',
    title: 'Deniz Manzaralı Lüks Villa',
    location: 'Bodrum, Muğla',
    price: 3500,
    rating: 4.9,
    reviewCount: 128,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Kapadokya Mağara Evi',
    location: 'Ürgüp, Nevşehir',
    price: 2800,
    rating: 4.8,
    reviewCount: 96,
    imageUrl: 'https://images.unsplash.com/photo-1621275471769-e6aa344546d5?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Orman İçerisinde Modern Bungalow',
    location: 'Sapanca, Sakarya',
    price: 1950,
    rating: 4.7,
    reviewCount: 73,
    imageUrl: 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'İstanbul Boğaz Manzaralı Daire',
    location: 'Beşiktaş, İstanbul',
    price: 4200,
    rating: 4.9,
    reviewCount: 152,
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop'
  }
];

export default function FeaturedListings() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Öne Çıkan Tatil Evleri</h2>
            <p className="text-black">Türkiye'nin en çok tercih edilen tatil evleri</p>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            Tümünü Gör
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <PropertyCard
                key={`skeleton-${index}`}
                id=""
                title=""
                location=""
                price={0}
                rating={0}
                reviewCount={0}
                imageUrl=""
                isLoading={true}
              />
            ))
          ) : (
            // Actual data
            featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PropertyCard
                  id={property.id}
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  rating={property.rating}
                  reviewCount={property.reviewCount}
                  imageUrl={property.imageUrl}
                  isFeatured={true}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
} 