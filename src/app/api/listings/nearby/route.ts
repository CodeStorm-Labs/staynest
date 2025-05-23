import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listing } from '@/db/schema/listing';
import { listingImage } from '@/db/schema/image';
import { and, eq, not, between, asc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  
  // Parse query params
  const lat = parseFloat(url.searchParams.get('lat') || '0');
  const lng = parseFloat(url.searchParams.get('lng') || '0');
  const distance = parseFloat(url.searchParams.get('distance') || '0.05'); // Default ~5km
  const excludeId = url.searchParams.get('exclude') || '';
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing latitude or longitude' }, { status: 400 });
  }
  
  try {
    // Find listings within the bounding box
    const minLat = lat - distance;
    const maxLat = lat + distance;
    const minLng = lng - distance;
    const maxLng = lng + distance;
    
    // Join with images to get the first image for each listing
    const listings = await db
      .select({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        address: listing.address,
        latitude: listing.latitude,
        longitude: listing.longitude,
        propertyType: listing.propertyType,
        imagePath: listingImage.imagePath
      })
      .from(listing)
      .leftJoin(
        listingImage,
        and(
          eq(listing.id, listingImage.listingId),
          eq(listingImage.isFeatured, 'true')  // isFeatured is stored as a text field with values 'true'/'false'
        )
      )
      .where(
        and(
          between(listing.latitude, minLat, maxLat),
          between(listing.longitude, minLng, maxLng),
          not(eq(listing.id, excludeId))
        )
      )
      .orderBy(asc(listing.price))
      .limit(limit);

    // Group by listing ID to avoid duplicates (in case there are multiple featured images)
    const uniqueListings = Array.from(
      listings.reduce((map, item) => {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
        return map;
      }, new Map())
    ).map(([_, listing]) => listing);
    
    return NextResponse.json(uniqueListings);
  } catch (error) {
    console.error('Error fetching nearby listings:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby listings' }, { status: 500 });
  }
} 