import { db } from '@/db';
import { listing, user } from '@/db/schema';
import Link from 'next/link';
import SearchFilters from '@/components/SearchFilters';
import ListingsGrid from '@/components/ListingsGrid';
import { eq, and, gte, lte, like, or } from 'drizzle-orm';

interface SearchParams {
  q?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
}

// Define our DB result type
interface ListingData {
  id: string;
  title: string;
  description: string | null;
  address: string;
  price: number;
  propertyType: string;
  createdAt: Date;
  hostId: string;
  hostTier: string | null;
}

export default async function ListingsPage({ 
  params,
  searchParams
}: { 
  params: { locale: string }, 
  searchParams: SearchParams
}) {
  try {
    // Extract parameters - explicitly convert to appropriate types
    const locale = String(params.locale);
    
    // Get filter parameters and ensure they're properly handled
    const q = searchParams?.q ? String(searchParams.q) : '';
    const type = searchParams?.type ? String(searchParams.type) : '';
    const minPrice = searchParams?.minPrice ? String(searchParams.minPrice) : '';
    const maxPrice = searchParams?.maxPrice ? String(searchParams.maxPrice) : '';
    const sortBy = searchParams?.sortBy ? String(searchParams.sortBy) : 'price_asc';

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
      // Type assertion to help TypeScript understand this is a valid enum value
      conditions.push(eq(listing.propertyType, type as any));
    }
    
    // Filter by price range
    if (minPrice) {
      conditions.push(gte(listing.price, parseInt(minPrice, 10)));
    }
    
    if (maxPrice) {
      conditions.push(lte(listing.price, parseInt(maxPrice, 10)));
    }
    
    // Build and execute the query with host information
    let dbResults: ListingData[] = [];
    
    try {
      if (conditions.length > 0) {
        dbResults = await db
          .select({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            address: listing.address,
            price: listing.price,
            propertyType: listing.propertyType,
            createdAt: listing.createdAt,
            hostId: listing.hostId,
            hostTier: user.tier
          })
          .from(listing)
          .leftJoin(user, eq(listing.hostId, user.id))
          .where(and(...conditions));
      } else {
        dbResults = await db
          .select({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            address: listing.address,
            price: listing.price,
            propertyType: listing.propertyType,
            createdAt: listing.createdAt,
            hostId: listing.hostId,
            hostTier: user.tier
          })
          .from(listing)
          .leftJoin(user, eq(listing.hostId, user.id));
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Keep dbResults as empty array
    }
    
    // Convert the DB results to the format expected by ListingsGrid
    // Specifically convert null descriptions to empty strings and handle hostTier
    const listingResults = dbResults.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '', // Replace null with empty string
      address: item.address,
      price: item.price,
      propertyType: item.propertyType,
      createdAt: item.createdAt,
      hostId: item.hostId,
      hostTier: item.hostTier || undefined // Convert null to undefined
    }));
    
    // Apply sorting in JavaScript since we already have the results
    if (sortBy === 'price_desc') {
      listingResults.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      listingResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Default: price_asc
      listingResults.sort((a, b) => a.price - b.price);
    }

    // Get min and max prices for the price range input
    let minPriceValue = 0;
    let maxPriceValue = 5000;
    
    try {
      const allPrices = await db.select({ price: listing.price }).from(listing);
      const prices = allPrices.map(item => item.price);
      if (prices.length) {
        minPriceValue = Math.min(...prices);
        maxPriceValue = Math.max(...prices);
      }
    } catch (error) {
      console.error("Error fetching price range:", error);
      // Use default values if query fails
    }

    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="container mx-auto px-4 py-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tüm İlanlar</h1>
            <p className="text-black mt-2">
              Harika konaklamalar keşfedin ve rezervasyon yapın
            </p>
          </div>
          
          {/* Search and Filters */}
          <SearchFilters 
            locale={locale} 
            minPrice={minPriceValue} 
            maxPrice={maxPriceValue}
          />
          
          {/* Results Info */}
          <div className="mb-6">
            <p className="text-black">
              <span className="font-semibold">{listingResults.length}</span> konaklama bulundu
              {q && <span> - Arama: "{q}"</span>}
            </p>
          </div>
          
          {/* Listings Grid */}
          <ListingsGrid listings={listingResults} locale={locale} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in listings page:", error);
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="container mx-auto px-4 py-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tüm İlanlar</h1>
            <p className="text-red-500 mt-2">
              İlanları yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
        </div>
      </div>
    );
  }
} 