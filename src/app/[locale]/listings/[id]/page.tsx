import { db } from '@/db';
import { listing } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookingForm from '@/components/BookingForm';
import ReviewsList from '@/components/ReviewsList';
import MapDisplay from '@/components/MapDisplay';
import Image from 'next/image';
import ReviewForm from '@/components/ReviewForm';
import ImageGallery from '@/components/ImageGallery';
import NearbyListings from '@/components/NearbyListings';

export async function generateStaticParams() {
  const all = await db.select({ id: listing.id }).from(listing);
  return all.map((l) => ({ id: l.id }));
}

// Function to fetch listing images
async function getListingImages(listingId: string) {
  try {
    // Check if NEXT_PUBLIC_API_URL already contains '/api' to avoid duplication
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const apiPath = baseUrl.endsWith('/api') || baseUrl.includes('/api/') 
      ? '' 
      : '/api';
    
    const response = await fetch(`${baseUrl}${apiPath}/images/${listingId}`, {
      cache: 'no-store'
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch listing images:', error);
    return [];
  }
}

// Sample amenities data - in a real app, this would come from the database
function getAmenitiesForPropertyType(propertyType: string) {
  const baseAmenities = [
    { name: 'Wi-Fi', icon: 'wifi', available: true },
    { name: 'Air Conditioning', icon: 'ac', available: true },
    { name: 'TV', icon: 'tv', available: true },
    { name: 'Kitchen', icon: 'kitchen', available: true },
    { name: 'Washer', icon: 'washer', available: true },
    { name: 'Free Parking', icon: 'parking', available: true },
  ];

  if (propertyType === 'HOUSE') {
    return [
      ...baseAmenities,
      { name: 'Swimming Pool', icon: 'pool', available: true },
      { name: 'Garden', icon: 'garden', available: true },
      { name: 'BBQ', icon: 'bbq', available: true },
      { name: 'Pets Allowed', icon: 'pets', available: false },
    ];
  } else if (propertyType === 'UNIQUE') {
    return [
      ...baseAmenities,
      { name: 'Mountain View', icon: 'view', available: true },
      { name: 'Fireplace', icon: 'fireplace', available: true },
      { name: 'Terrace', icon: 'terrace', available: true },
      { name: 'Heating', icon: 'heating', available: true },
    ];
  } else if (propertyType === 'HOTEL') {
    return [
      ...baseAmenities.filter(a => a.name !== 'Kitchen' && a.name !== 'Washer'), // Remove kitchen and washer
      { name: 'Room Service', icon: 'room-service', available: true },
      { name: 'Restaurant', icon: 'restaurant', available: true },
      { name: 'Fitness Center', icon: 'gym', available: true },
      { name: 'Spa', icon: 'spa', available: true },
      { name: 'Concierge', icon: 'concierge', available: true },
      { name: 'Daily Housekeeping', icon: 'cleaning', available: true },
    ];
  } else {
    // APARTMENT
    return [
      ...baseAmenities,
      { name: 'Elevator', icon: 'elevator', available: true },
      { name: 'Gym', icon: 'gym', available: true },
      { name: 'Security', icon: 'security', available: true },
      { name: 'Balcony', icon: 'balcony', available: false },
    ];
  }
}

// Helper function to render amenity icon
function getAmenityIcon(iconName: string, available: boolean) {
  const baseClass = "h-6 w-6";
  const colorClass = available ? "text-primary" : "text-muted-foreground";
  
  switch(iconName) {
    case 'wifi':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
        </svg>
      );
    case 'ac':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M3 10h18" />
          <path strokeLinecap="round" strokeWidth={2} d="M7 14h2m4 0h4" />
          <path strokeLinecap="round" strokeWidth={2} d="M9 22l3-3m3 3l-3-3" />
        </svg>
      );
    case 'tv':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="2" y="5" width="20" height="13" rx="2" strokeWidth={2} />
          <line x1="8" y1="21" x2="16" y2="21" strokeWidth={2} />
          <line x1="12" y1="18" x2="12" y2="21" strokeWidth={2} />
          <path d="M6 9a1 1 0 011-1h10a1 1 0 011 1v5a1 1 0 01-1 1H7a1 1 0 01-1-1V9z" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case 'kitchen':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M3 10h18" />
          <circle cx="7" cy="7.5" r="1" strokeWidth={2} />
          <circle cx="11" cy="7.5" r="1" strokeWidth={2} />
          <circle cx="15" cy="7.5" r="1" strokeWidth={2} />
          <rect x="5" y="13" width="6" height="4" rx="1" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M15 13h2m0 2h-2m0 2h2" />
        </svg>
      );
    case 'washer':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          <circle cx="12" cy="13" r="4" strokeWidth={2} />
          <circle cx="8" cy="6" r="1" strokeWidth={2} />
          <circle cx="12" cy="6" r="1" strokeWidth={2} />
          <path d="M10 13a2 2 0 014 0" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case 'parking':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h4a2 2 0 012 2v2a2 2 0 01-2 2H8V8z" />
          <path strokeLinecap="round" strokeWidth={2} d="M8 14v2" />
        </svg>
      );
    case 'pool':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9.5C5.5 8 7 9.5 8.5 8S10 9.5 11.5 8 13 9.5 14.5 8 16 9.5 17.5 8 19 9.5 20 8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12.5C5.5 11 7 12.5 8.5 11S10 12.5 11.5 11 13 12.5 14.5 11 16 12.5 17.5 11 19 12.5 20 11" />
          <line x1="8.5" y1="5" x2="8.5" y2="17" strokeWidth={2} />
          <line x1="15.5" y1="5" x2="15.5" y2="17" strokeWidth={2} />
        </svg>
      );
    case 'garden':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v10m-4-6c0 4 4 6 8 6-4 0-8-2-8-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10c1.5-2 1.5-5-1-7 3 1 6 3 6 7-2 0-3 0-5 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10c-1.5-2-1.5-5 1-7-3 1-6 3-6 7 2 0 3 0 5 0z" />
          <path strokeLinecap="round" strokeWidth={2} d="M7 21h10" />
        </svg>
      );
    case 'bbq':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="6.5" r="3.5" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M5 14h14M8 14l1 6M16 14l-1 6" />
          <path strokeLinecap="round" strokeWidth={2} d="M12 14v6" />
          <path strokeLinecap="round" strokeWidth={2} d="M8 9.5h8" />
          <path d="M8.5 6.5a3.5 3.5 0 017 0z" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case 'pets':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm3 4.5c-1-2.5-2.5-3.5-5-3.5-1.5 0-2.7.3-3.5 1-.3.3-.6.5-1 .5s-.7-.2-1-.5c-.8-.7-2-1-3.5-1-2.5 0-4 1-5 3.5-1 2.5-1 5.5 2 8 1.5 1.2 3 1.5 5 1.5 1 0 2.5-.5 4-2 1.5 1.5 3 2 4 2 2 0 3.5-.3 5-1.5 3-2.5 3-5.5 2-8z" />
          <circle cx="11" cy="11" r="0.5" strokeWidth={1.5} />
          <circle cx="13" cy="11" r="0.5" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeWidth={2} d="M11.5 13c.5.5 1.5.5 2 0" />
        </svg>
      );
    case 'view':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-2z" />
          <path strokeLinecap="round" strokeWidth={2} d="M9 6.5v3m6-3v3M9 14.5v3m6-3v3" />
          <path d="M6 6h12v2H6V6zm0 10h12v2H6v-2z" fill="currentColor" opacity="0.15" />
        </svg>
      );
    case 'fireplace':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16c0-6-3-8-3-12M12 4c0 4 4 5 4 8-2-1-4-1-4 4-2-3-1.5-7-5-8 5-1 5-2 5-4z" />
          <path strokeLinecap="round" strokeWidth={2} d="M5 20h14" />
          <path d="M12 8c2 0 2 1 2 2 0 2-4 2-4 0 0-1 0-2 2-2z" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case 'terrace':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16M4 20v-7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11V8c0-1.7 1.3-3 3-3s3 1.3 3 3v3" />
          <line x1="4" y1="16" x2="20" y2="16" strokeWidth={2} />
          <line x1="8" y1="16" x2="8" y2="20" strokeWidth={2} />
          <line x1="16" y1="16" x2="16" y2="20" strokeWidth={2} />
          <path d="M6 13h12v3H6v-3z" fill="currentColor" opacity="0.15" />
        </svg>
      );
    case 'heating':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v10" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7l3 3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7l-3 3" />
          <path d="M12 12a2 2 0 100 4 2 2 0 000-4z" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case 'elevator':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth={2} />
          <line x1="4" y1="7" x2="20" y2="7" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3 3 3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l3 3 3-3" />
          <line x1="12" y1="8" x2="12" y2="19" strokeWidth={2} />
          <path d="M6 8h12v11H6V8z" fill="currentColor" opacity="0.1" />
        </svg>
      );
    case 'gym':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M4 9v6M20 9v6" />
          <rect x="7" y="8" width="2" height="8" rx="1" strokeWidth={2} />
          <rect x="15" y="8" width="2" height="8" rx="1" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M2 12h2m16 0h2" />
          <path d="M7 10h2v4H7v-4zm8 0h2v4h-2v-4z" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case 'security':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m-7 7h2m12 0h2m-7 7v2M5.45 5.11L7.96 7.62 4.5 12l3.46 4.38-2.51 2.51L2.9 12l2.55-6.89zm13.1 0L16.04 7.62 19.5 12l-3.46 4.38 2.51 2.51L21.1 12l-2.55-6.89z" />
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
          <path d="M12 10a2 2 0 100 4 2 2 0 000-4z" fill="currentColor" opacity="0.2" />
        </svg>
      );
    case 'balcony':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18v4H3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9v11h18V9" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9v6m6-6v6" />
          <rect x="3" y="15" width="18" height="5" strokeWidth={2} />
          <path d="M3 5h18v4H3V5z" fill="currentColor" opacity="0.15" />
          <path d="M3 15h18v5H3v-5z" fill="currentColor" opacity="0.15" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`${baseClass} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
  }
}

function getPropertyDetails(propertyType: string) {
  switch(propertyType) {
    case 'APARTMENT':
      return {
        type: 'Daire',
        beds: 2,
        baths: 1,
        guests: 4,
        rooms: 3,
        area: '80 m²'
      };
    case 'HOUSE':
      return {
        type: 'Ev',
        beds: 4,
        baths: 2,
        guests: 8,
        rooms: 5,
        area: '150 m²'
      };
    case 'UNIQUE':
      return {
        type: 'Özel Konaklama',
        beds: 3,
        baths: 2,
        guests: 6,
        rooms: 4,
        area: '120 m²'
      };
    case 'HOTEL':
      return {
        type: 'Otel',
        beds: 1,
        baths: 1,
        guests: 2,
        rooms: 1,
        area: '40 m²'
      };
    default:
      return {
        type: propertyType,
        beds: 2,
        baths: 1,
        guests: 4,
        rooms: 3,
        area: '80 m²'
      };
  }
}

export default async function ListingPage({ params }: { params: { locale: string; id: string } }) {
  const { locale, id } = await params;
  const [item] = await db.select().from(listing).where(eq(listing.id, id));
  if (!item) notFound();

  // Fetch actual images for the listing
  const images = await getListingImages(id);
  
  // Get amenities for this property type
  const amenities = getAmenitiesForPropertyType(item.propertyType);
  
  // Get property details
  const propertyDetails = getPropertyDetails(item.propertyType);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/${locale}/listings`} className="text-primary hover:underline mb-6 inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Listeye geri dön
      </Link>
      
      {/* Property Title and Location */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {item.address}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Listing Images Gallery */}
          <div className="mb-8">
            <ImageGallery images={images} title={item.title} />
          </div>
          
          {/* Quick Info Bar */}
          <div className="mb-8 bg-card p-6 rounded-xl shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div>
                <div className="text-muted-foreground text-sm mb-1">Tür</div>
                <div className="font-semibold">{propertyDetails.type}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm mb-1">Yatak</div>
                <div className="font-semibold">{propertyDetails.beds}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm mb-1">Banyo</div>
                <div className="font-semibold">{propertyDetails.baths}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm mb-1">Misafir</div>
                <div className="font-semibold">{propertyDetails.guests}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm mb-1">Alan</div>
                <div className="font-semibold">{propertyDetails.area}</div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Açıklama</h2>
            <p className="whitespace-pre-line">{item.description}</p>
          </div>
          
          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Özellikler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {amenities.map((amenity, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 p-2.5 rounded-lg 
                    ${amenity.available ? "hover:bg-primary/5" : "hover:bg-muted/60"} 
                    transition-colors`}
                >
                  <div className={`${amenity.available ? "bg-primary/10" : "bg-muted/10"} p-1.5 rounded-full`}>
                  {getAmenityIcon(amenity.icon, amenity.available)}
                  </div>
                  <span className={amenity.available 
                    ? "font-medium" 
                    : "text-muted-foreground line-through opacity-75"
                  }>
                    {amenity.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Map */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Konum</h2>
            <div className="p-6 bg-card rounded-xl border">
              <div className="flex items-start gap-4">
                <div className="text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Adres</h3>
                  <p className="text-card-foreground">{item.address}</p>
                  <p className="text-muted-foreground text-sm mt-2">Tam konum rezervasyon yaptıktan sonra paylaşılacaktır.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reviews */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Değerlendirmeler</h2>
            <ReviewsList listingId={id} />
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Değerlendirme Yap</h3>
              <ReviewForm listingId={id} />
            </div>
          </div>
          
          {/* Nearby Listings */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Yakındaki Diğer Konaklama Yerleri</h2>
            <NearbyListings 
              currentListingId={id}
              latitude={item.latitude} 
              longitude={item.longitude}
              distanceKm={5}
            />
          </div>
        </div>
        
        {/* Booking Form Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-card rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">{item.price} / gece</h2>
          <BookingForm 
                listingId={id} 
            price={item.price}
            title={item.title}
          />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 