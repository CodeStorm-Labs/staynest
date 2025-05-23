'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import FeaturedBadge from './FeaturedBadge';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isFeatured?: boolean;
  isLoading?: boolean;
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  rating,
  reviewCount,
  imageUrl,
  isFeatured = false,
  isLoading = false
}: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden h-full animate-pulse">
        <div className="bg-gray-300 h-48 w-full" />
        <div className="p-4">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  // Generate star rating display
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {Array(5).fill(0).map((_, index) => (
          <Star 
            key={index} 
            className={`h-4 w-4 ${
              index < fullStars 
                ? 'text-yellow-400 fill-yellow-400' 
                : index === fullStars && hasHalfStar
                  ? 'text-yellow-400 fill-yellow-400/50'
                  : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-md overflow-hidden h-full transform transition duration-200"
    >
      <div className="relative h-48">
        <Image 
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
          aria-label={isLiked ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        
        {isFeatured && (
          <div className="absolute top-3 left-3 z-10">
            <FeaturedBadge />
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/tr/listings/${id}`} className="block">
          <div className="flex items-center mb-1">
            <MapPin className="h-3 w-3 text-blue-600 mr-1" />
            <p className="text-sm text-black font-medium">{location}</p>
          </div>
          <h3 className="font-semibold text-lg mb-1 text-black hover:text-blue-600 transition-colors line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center mb-3 gap-2">
            {renderStars()}
            <span className="text-sm font-medium text-black">{rating.toFixed(1)}</span>
            <span className="text-sm text-black ml-1">({reviewCount} değerlendirme)</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-bold text-black text-lg">
              {price.toLocaleString('tr-TR')} ₺
              <span className="text-black text-sm font-normal"> / gece</span>
            </p>
            {!isFeatured && (
              <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">İncele</span>
            )}
          </div>
        </Link>
      </div>
    </motion.div>
  );
} 