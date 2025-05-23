import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listing, user } from '@/db/schema';
import { isAdmin } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    // Fetch all listings with user details
    const listings = await db
      .select({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        hostId: listing.hostId,
        userName: user.name,
        userEmail: user.email,
        propertyType: listing.propertyType,
        address: listing.address
      })
      .from(listing)
      .leftJoin(user, eq(user.id, listing.hostId))
      .orderBy(listing.createdAt);
    
    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 