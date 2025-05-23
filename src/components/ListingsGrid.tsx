'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Image {
  id: string;
  imagePath: string;
  isFeatured: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  propertyType: string;
  hostTier?: string;
  images?: Image[];
}

interface ListingsGridProps {
  listings: Listing[];
  locale: string;
}

export default function ListingsGrid({ listings, locale }: ListingsGridProps) {
  const [listingsWithImages, setListingsWithImages] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchListingImages() {
      setIsLoading(true);
      try {
        const updatedListings = await Promise.all(
          listings.map(async (listing) => {
            try {
              const response = await fetch(`/api/images/${listing.id}`, {
                // Add cache busting parameter to avoid browser caching
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                  return { ...listing, images: data };
                }
              }
            } catch (error) {
              console.error(`Failed to fetch images for listing ${listing.id}:`, error);
            }
            return listing;
          })
        );
        setListingsWithImages(updatedListings);
      } catch (error) {
        console.error('Error fetching listing images:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchListingImages();
  }, [listings]);

  // If no listings are found
  if (listings.length === 0) {
    return (
      <div className="w-full py-10 text-center">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-black mb-2">Sonuç bulunamadı</h3>
        <p className="text-black mb-4">Arama kriterlerinize uygun ilan bulunmamaktadır.</p>
      </div>
    );
  }

  // Helper function to get property type label in Turkish
  const getPropertyTypeLabel = (type: string) => {
    switch(type) {
      case 'APARTMENT':
        return 'Daire';
      case 'HOUSE':
        return 'Ev';
      case 'UNIQUE':
        return 'Özel';
      case 'HOTEL':
        return 'Otel';
      default:
        return type;
    }
  };

  // Get the featured image or first image, or fall back to placeholder based on property type
  const getListingImage = (listing: Listing) => {
    if (listing.images && listing.images.length > 0) {
      // First check for featured image
      const featuredImage = listing.images.find(img => img.isFeatured === 'true');
      if (featuredImage) {
        return featuredImage.imagePath;
      }
      // Otherwise use the first image
      return listing.images[0].imagePath;
    }
    
    // Generate unique placeholders based on listing ID if no API images are available
    const getPlaceholderByPropertyType = (propertyType: string, id: string) => {
      const apartmentImages = [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb'
      ];
      
      const houseImages = [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
        'https://images.unsplash.com/photo-1576941089067-2de3c901e126',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff'
      ];
      
      const uniqueImages = [
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
        'https://images.unsplash.com/photo-1542718610-a1d656d1884c',
        'https://images.unsplash.com/photo-1516402707257-787c50fc3898',
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'
      ];
      
      const hotelImages = [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e'
      ];
      
      let images;
      switch(propertyType) {
        case 'APARTMENT':
          images = apartmentImages;
          break;
        case 'HOUSE':
          images = houseImages;
          break;
        case 'UNIQUE':
          images = uniqueImages;
          break;
        case 'HOTEL':
          images = hotelImages;
          break;
        default:
          images = [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
            'https://images.unsplash.com/photo-1554995207-c18c203602cb',
            'https://images.unsplash.com/photo-1494526585095-c41746248156'
          ];
      }
      
      // Use a hash of the listing ID to select a consistent image
      const hash = id.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
      const selectedImage = images[hash % images.length];
      
      // Add parameters to prevent caching and make each image unique
      return `${selectedImage}?q=80&w=2070&auto=format&fit=crop&listing=${id}`;
    };
    
    return getPlaceholderByPropertyType(listing.propertyType, listing.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(isLoading ? listings : listingsWithImages).map((listing) => (
        <Link key={listing.id} href={`/${locale}/listings/${listing.id}`}>
          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
            <div className="relative h-48 w-full">
              <Image 
                src={getListingImage(listing)}
                alt={listing.title}
                fill
                className="object-cover"
                priority={true}
                // Add key prop to force re-render when image changes
                key={`listing-image-${listing.id}`}
                // Add unique cache-busting query parameter
                unoptimized={true}
              />
              <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-bold text-black">
                {getPropertyTypeLabel(listing.propertyType)}
              </div>
              
              {/* Pro badge for listings from pro tier users */}
              {listing.hostTier === 'pro' && (
                <div className="absolute top-3 left-3 bg-purple-600 px-2 py-1 rounded-full text-xs font-bold text-white">
                  Pro
                </div>
              )}
            </div>
            
            <div className="p-5 flex-grow flex flex-col">
              <h3 className="font-bold text-lg mb-1 line-clamp-1 text-black">{listing.title}</h3>
              <p className="text-black text-sm mb-2">{listing.address}</p>
              <p className="text-black text-sm line-clamp-2 mb-3">{listing.description}</p>
              
              <div className="mt-auto pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600 text-lg">{listing.price}₺<span className="text-black font-normal text-sm"> / gece</span></span>
                  <span className="text-sm text-blue-600 font-bold">Detayları görüntüle</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 