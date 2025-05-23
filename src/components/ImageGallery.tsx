'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ListingImage {
  id: string;
  imagePath: string;
  isFeatured: string;
  sortOrder: string;
}

interface ImageGalleryProps {
  images: ListingImage[];
  title: string;
}

// Function to get fallback images if no images are available
const getFallbackImages = () => [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1965&auto=format&fit=crop',
];

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  useEffect(() => {
    // Use listing images if available, otherwise use fallbacks
    if (images && images.length > 0) {
      setGalleryImages(images.map(img => img.imagePath));
    } else {
      setGalleryImages(getFallbackImages());
    }
  }, [images]);

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (galleryImages.length === 0) {
    return <div className="animate-pulse bg-gray-200 rounded-xl aspect-[16/9] w-full"></div>;
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={galleryImages[currentImageIndex]}
          alt={`${title} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        
        {/* Navigation buttons */}
        {galleryImages.length > 1 && (
          <>
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition-all"
              onClick={goToPrevImage}
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition-all"
              onClick={goToNextImage}
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1} / {galleryImages.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {galleryImages.map((img, index) => (
            <div 
              key={index}
              className={`relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all ${
                index === currentImageIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 