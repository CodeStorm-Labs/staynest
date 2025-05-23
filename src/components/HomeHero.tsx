'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import HeroSearch from './HeroSearch';

const backgroundImages = [
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80', // Istanbul
  'https://images.unsplash.com/photo-1464082354059-27db6ce50048?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Bodrum
  'https://images.unsplash.com/photo-1669219251918-3471ba9bd248?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Kapadokya
];

// Fallback image if any of the main images fail
const fallbackImage = 'https://images.unsplash.com/photo-1630583282918-07c6a122df76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';

export default function HomeHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Preload images
  useEffect(() => {
    if (typeof window !== 'undefined') {
      backgroundImages.forEach((src, index) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [index]: true }));
        };
        img.onerror = () => {
          setImageErrors(prev => ({ ...prev, [index]: true }));
        };
      });
    }
  }, []);

  // Image rotation effect with smoother transitions
  useEffect(() => {
    setIsLoaded(true);
    
    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      
      // Preload next image
      const nextIndex = (currentImageIndex + 1) % backgroundImages.length;
      setNextImageIndex(nextIndex);
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setCurrentImageIndex(nextIndex);
        setIsTransitioning(false);
      }, 100);
    }, 8000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentImageIndex]);
  
  return (
    <div className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Base background to prevent any flashing */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800" 
        style={{ zIndex: 1 }}
      />
      
      {/* Fixed background (visible immediately) */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <Image
          src={imageErrors[0] ? fallbackImage : backgroundImages[0]}
          alt=""
          fill
          priority={true}
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
          loading="eager"
          onError={() => {
            setImageErrors(prev => ({ ...prev, [0]: true }));
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>
      
      {/* Rotating backgrounds (visible after JS loads) */}
      {isLoaded && backgroundImages.map((image, index) => (
        <div
          key={`bg-${index}`}
          className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
            index === currentImageIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ zIndex: 3 }}
        >
          <Image
            src={imageErrors[index] ? fallbackImage : image}
            alt=""
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
            loading={index === 0 ? "eager" : "lazy"}
            onError={() => {
              setImageErrors(prev => ({ ...prev, [index]: true }));
            }}
            onLoad={() => {
              setLoadedImages(prev => ({ ...prev, [index]: true }));
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
      ))}
      
      {/* Content */}
      <div className="relative container mx-auto px-6 flex flex-col items-center" style={{ zIndex: 10 }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6 max-w-4xl"
        >
          Hayalinizdeki Konaklamayı Keşfedin
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-white text-center mb-12 max-w-2xl"
        >
          Türkiye&apos;nin dört bir yanındaki eşsiz konaklama yerlerini keşfedin ve unutulmaz anılar biriktirin.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-4xl"
        >
          <HeroSearch />
        </motion.div>
      </div>
    </div>
  );
} 