import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listing, propertyType } from '@/db/schema';
import { v4 as uuid } from 'uuid';
import { eq, and, gte, lte, like, or, desc, asc, SQL } from 'drizzle-orm';
import { getAuthSession } from '@/lib/auth-utils';

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, description, address, latitude, longitude, price, propertyType: propType } = await request.json();
  const id = uuid();
  await db.insert(listing).values({
    id,
    hostId: session.user.id,
    title,
    description,
    address,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    price: parseInt(price, 10),
    propertyType: propType,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return NextResponse.json({ success: true, id });
}

// GET listings with search and filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get filter parameters
  const q = searchParams.get('q');
  const type = searchParams.get('type');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = searchParams.get('sortBy') || 'price_asc';
  
  // Check if requesting user's listings or public listings
  const isUserListings = searchParams.get('userOnly') === 'true';
  
  // Conditions array to build the query
  const conditions: SQL<unknown>[] = [];
  
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
  if (type && ['APARTMENT', 'HOUSE', 'UNIQUE', 'HOTEL'].includes(type)) {
    // Cast the type to the union of possible property types
    const propertyTypeValue = type as 'APARTMENT' | 'HOUSE' | 'UNIQUE' | 'HOTEL';
    conditions.push(eq(listing.propertyType, propertyTypeValue));
  }
  
  // Filter by price range
  if (minPrice) {
    conditions.push(gte(listing.price, parseInt(minPrice, 10)));
  }
  
  if (maxPrice) {
    conditions.push(lte(listing.price, parseInt(maxPrice, 10)));
  }
  
  // Handle user's listings requests
  if (isUserListings) {
    const session = await getAuthSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    conditions.push(eq(listing.hostId, session.user.id));
  }
  
  // Build and execute the query
  let listingResults;
  
  if (conditions.length > 0) {
    listingResults = await db
      .select()
      .from(listing)
      .where(and(...conditions))
      .orderBy(
        sortBy === 'price_desc' 
          ? desc(listing.price) 
          : sortBy === 'newest' 
            ? desc(listing.createdAt) 
            : asc(listing.price)
      );
  } else {
    listingResults = await db
      .select()
      .from(listing)
      .orderBy(
        sortBy === 'price_desc' 
          ? desc(listing.price) 
          : sortBy === 'newest' 
            ? desc(listing.createdAt) 
            : asc(listing.price)
      );
  }
  
  return NextResponse.json(listingResults);
} 