import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { booking, listing, user } from '@/db/schema';
import { isAdmin } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    // Fetch all bookings with listing and user details
    const bookings = await db
      .select({
        id: booking.id,
        listingId: booking.listingId,
        userId: booking.userId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        listingTitle: listing.title,
        userName: user.name,
        userEmail: user.email
      })
      .from(booking)
      .leftJoin(listing, eq(listing.id, booking.listingId))
      .leftJoin(user, eq(user.id, booking.userId))
      .orderBy(booking.createdAt);
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 