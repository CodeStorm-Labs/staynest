import { db } from '@/db';
import { listing } from '@/db/schema';
import Link from 'next/link';
import { eq, and, gte, lte, like, or } from 'drizzle-orm';
import MapDisplay from '@/components/MapDisplay';

export default async function MapViewPage({ 
  params: { locale },
  searchParams
}: { 
  params: { locale: string }, 
  searchParams: { 
    q?: string, 
    type?: string, 
    minPrice?: string, 
    maxPrice?: string,
    sortBy?: string 
  } 
}) {
  // Get filter parameters (same as listings page)
  const { q, type, minPrice, maxPrice } = searchParams;

  // Build query conditions
  const conditions = [];
  
  // Search by query string (in title, description, or address)
  if (q) {
    conditions.push(
      or(
        like(listing.title, `%${q}%`),
        like(listing.description, `%${q}%`),
        like(listing.address, `%${q}%`)
      )
    );
  }
  
  // Filter by property type
  if (type && ['APARTMENT', 'HOUSE', 'UNIQUE'].includes(type)) {
    conditions.push(eq(listing.propertyType, type as any));
  }
  
  // Filter by price range
  if (minPrice) {
    conditions.push(gte(listing.price, parseInt(minPrice, 10)));
  }
  
  if (maxPrice) {
    conditions.push(lte(listing.price, parseInt(maxPrice, 10)));
  }
  
  // Build and execute the query
  let listingResults;
  
  if (conditions.length > 0) {
    listingResults = await db
      .select()
      .from(listing)
      .where(and(...conditions));
  } else {
    listingResults = await db.select().from(listing);
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Harita Görünümü</h1>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">{listingResults.length}</span> konaklama bulundu
              {q && <span> - Arama: "{q}"</span>}
            </p>
          </div>
          
          <Link 
            href={`/${locale}/listings${searchParams ? `?${new URLSearchParams(searchParams as any).toString()}` : ''}`}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Liste Görünümü
          </Link>
        </div>
        
        {/* Map View */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-[calc(100vh-250px)] w-full">
            <MapDisplay 
              markers={listingResults.map(item => ({
                latitude: item.latitude,
                longitude: item.longitude,
                popupText: `
                  <div>
                    <h3 class="font-bold">${item.title}</h3>
                    <p>${item.price}₺ / gece</p>
                    <a href="/${locale}/listings/${item.id}" class="text-blue-600 hover:underline">Detaylar</a>
                  </div>
                `
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 